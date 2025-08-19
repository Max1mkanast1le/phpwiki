<?php

class DataManager
{
    private string $filePath;
    private array $data;

    public function __construct(string $filePath = 'data.json')
    {
        $this->filePath = $filePath;
        $this->data = json_decode(file_get_contents($this->filePath), true);
    }

    // Сохраняем все изменения в файл при уничтожении объекта
    public function __destruct()
    {
        file_put_contents($this->filePath, json_encode($this->data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    // --- ОБЩИЕ МЕТОДЫ CRUD ---

    public function getAll(string $entity): array
    {
        $items = $this->data[$entity] ?? [];
        // Добавим связанные сущности к каждому элементу для удобства фронтенда
        foreach ($items as &$item) {
            if ($entity === 'contacts') {
                $item['deals'] = $this->getDealsForContact($item['id']);
            } elseif ($entity === 'deals') {
                $item['contacts'] = $this->getContactsForDeal($item['id']);
            }
        }
        return array_values($items); // Возвращаем как простой массив
    }

    public function getById(string $entity, int $id): ?array
    {
        $item = $this->data[$entity][$id] ?? null;
        if ($item) {
             if ($entity === 'contacts') {
                $item['deals'] = $this->getDealsForContact($id);
            } elseif ($entity === 'deals') {
                $item['contacts'] = $this->getContactsForDeal($id);
            }
        }
        return $item;
    }

    public function create(string $entity, array $itemData): array
    {
        $nextIdKey = 'next_' . rtrim($entity, 's') . '_id';
        $newId = $this->data['meta'][$nextIdKey]++;

        $newItem = ['id' => $newId] + $itemData;

        if ($entity === 'contacts') {
             $this->data['contacts'][$newId] = [
                'id' => $newId,
                'first_name' => $itemData['first_name'],
                'last_name' => $itemData['last_name']
            ];
            $this->updateLinks('contacts', $newId, $itemData['deal_ids'] ?? []);

        } elseif ($entity === 'deals') {
            $this->data['deals'][$newId] = [
                'id' => $newId,
                'name' => $itemData['name'],
                'sum' => $itemData['sum']
            ];
            $this->updateLinks('deals', $newId, $itemData['contact_ids'] ?? []);
        }

        return $this->getById($entity, $newId);
    }

    public function update(string $entity, int $id, array $itemData): ?array
    {
        if (!isset($this->data[$entity][$id])) return null;

        if ($entity === 'contacts') {
            $this->data[$entity][$id]['first_name'] = $itemData['first_name'];
            $this->data[$entity][$id]['last_name'] = $itemData['last_name'];
            $this->updateLinks('contacts', $id, $itemData['deal_ids'] ?? []);
        } elseif ($entity === 'deals') {
             $this->data[$entity][$id]['name'] = $itemData['name'];
             $this->data[$entity][$id]['sum'] = $itemData['sum'];
             $this->updateLinks('deals', $id, $itemData['contact_ids'] ?? []);
        }

        return $this->getById($entity, $id);
    }

    public function delete(string $entity, int $id): bool
    {
        if (!isset($this->data[$entity][$id])) return false;

        // Удаляем саму сущность
        unset($this->data[$entity][$id]);

        // Удаляем все связанные с ней записи из contacts_deals
        $linkKey = rtrim($entity, 's') . '_id';
        $this->data['contacts_deals'] = array_filter(
            $this->data['contacts_deals'],
            fn($link) => $link[$linkKey] != $id
        );

        return true;
    }

    // --- МЕТОДЫ ДЛЯ РАБОТЫ СО СВЯЗЯМИ ---

    private function getDealsForContact(int $contactId): array
    {
        $dealIds = [];
        foreach ($this->data['contacts_deals'] as $link) {
            if ($link['contact_id'] == $contactId) {
                $dealIds[] = $link['deal_id'];
            }
        }
        return array_map(fn($id) => $this->data['deals'][$id] ?? null, $dealIds);
    }

    private function getContactsForDeal(int $dealId): array
    {
        $contactIds = [];
        foreach ($this->data['contacts_deals'] as $link) {
            if ($link['deal_id'] == $dealId) {
                $contactIds[] = $link['contact_id'];
            }
        }
        return array_map(fn($id) => $this->data['contacts'][$id] ?? null, $contactIds);
    }

    private function updateLinks(string $sourceEntity, int $sourceId, array $targetIds): void
    {
        // Определяем ключи для таблицы связей
        $sourceKey = rtrim($sourceEntity, 's') . '_id';
        $targetKey = ($sourceEntity === 'contacts') ? 'deal_id' : 'contact_id';

        // 1. Удаляем все старые связи для этой сущности
        $this->data['contacts_deals'] = array_filter(
            $this->data['contacts_deals'],
            fn($link) => $link[$sourceKey] != $sourceId
        );

        // 2. Добавляем новые связи
        foreach ($targetIds as $targetId) {
            $this->data['contacts_deals'][] = [
                $sourceKey => $sourceId,
                $targetKey => (int)$targetId
            ];
        }
    }
}