<?php

namespace App\Http\Controllers;

use App\Exports\UnitExport;
use App\Models\Unit;
use Illuminate\Http\Request;
use App\Http\Requests\UnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use App\Imports\UnitImport;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class UnitController extends Controller
{
    public function index()
    {
        $units = Unit::all();

        return response()->json([
            'status' => 'success',
            'message' => 'Danh sách đơn vị.',
            'data' => $units
        ]);
    }

    public function store(UnitRequest $request)
    {
        try {
            $data = $request->validated();
            $data['created_by'] = Auth::id();
            $data['updated_by'] = Auth::id();

            $unit = Unit::create($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo đơn vị thành công.',
                'data' => $unit
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi tạo đơn vị: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $unit = Unit::findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Chi tiết đơn vị.',
                'data' => $unit
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy đơn vị: ' . $e->getMessage()
            ], 404);
        }
    }

    public function update(UpdateUnitRequest $request, $id)
    {
        try {
            $unit = Unit::findOrFail($id);
            $data = $request->validated();
            $data['updated_by'] = Auth::id();

            $unit->update($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật đơn vị thành công.',
                'data' => $unit
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi cập nhật đơn vị: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $unit = Unit::findOrFail($id);
            $unit->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa đơn vị thành công.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi xóa đơn vị: ' . $e->getMessage()
            ], 500);
        }
    }


    public function export()
    {
        return Excel::download(new UnitExport, 'Unit.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv'
        ]);

        Excel::import(new UnitImport, $request->file('file'));

        return response()->json([
            'status' => 'success',
            'message' => 'Nhập thương hiệu thành công.'
        ]);
    }
}
