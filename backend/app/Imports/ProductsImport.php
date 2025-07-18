<?php

namespace App\Imports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductsImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return DB::transaction(function () use ($row) {
            $product = Product::create([
                'product_name' => $row['product_name'],
                'buying_price' => $row['buying_price'],
                'short_description' => $row['short_description'],
                'product_description' => $row['product_description'],
                'active' => $row['active'],
                'disable_out_of_stock' => $row['disable_out_of_stock'],
                'unit_id' => $row['unit_id'],
                'created_by' => Auth::id() ?? 1,
                'updated_by' => Auth::id() ?? 1,
            ]);

            // Gắn danh mục
            if (!empty($row['categories'])) {
                $categoryIds = explode(',', $row['categories']);
                $product->categories()->sync($categoryIds);
            }

            // Gắn thương hiệu
            if (!empty($row['brands'])) {
                $brandIds = explode(',', $row['brands']);
                $product->brands()->sync($brandIds);
            }

            // Gắn tags
            if (!empty($row['tags'])) {
                $tagIds = explode(',', $row['tags']);
                $product->tags()->sync($tagIds);
            }

            // Lưu hình ảnh từ URL
            if (!empty($row['image_urls'])) {
                $imageUrls = explode(',', $row['image_urls']);
                $mainIndex = intval($row['is_main_index'] ?? 0);

                foreach ($imageUrls as $index => $url) {
                    $product->images()->create([
                        'image' => trim($url), // URL hoặc đã tải lên sẵn
                        'is_main' => $index === $mainIndex,
                    ]);
                }
            }

            return $product;
        });
    }
}
