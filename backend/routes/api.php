<?php

use App\Http\Controllers\FacebookController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SlideshowController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\GetProductForClient;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductSaleController;
use App\Http\Controllers\ProductStoreController;
use App\Http\Controllers\RevenueController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserAddressController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VnpayController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;


//BEGIN ROUTE API RESOURCE
Route::apiResource('users', UserController::class);
Route::apiResource('orders', OrderController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('brands', BrandController::class);
Route::apiResource('unit', UnitController::class);
Route::apiResource('slideshow', SlideshowController::class);
Route::apiResource('products', ProductController::class);
Route::apiResource('store', ProductStoreController::class)->except(['show']);
Route::apiResource('tags', TagController::class);
Route::apiResource('topic', TopicController::class);
Route::apiResource('post', PostController::class);
Route::apiResource('slideshow', SlideshowController::class);
Route::post('slideshow/{slideshow}/click', [SlideshowController::class, 'incrementClicks'])->name('slideshows.click');
Route::apiResource('coupon', CouponController::class);
Route::post('coupon/{coupon}/use', [CouponController::class, 'incrementTimesUsed'])->name('coupons.use');
Route::post('coupon/check', [CouponController::class, 'checkCoupon'])->name('coupons.check');
Route::apiResource('product-sale', ProductSaleController::class);
//END ROUTE API RESOURCE
// -----------------------------------------------------------------
//BEGIN ROUTE API IMPORT/EXPORT

Route::get('store/export', [ProductStoreController::class, 'export']);
Route::post('store/import', [ProductStoreController::class, 'import']);

Route::post('product/import', [ProductController::class, 'import']);
Route::get('product/export', [ProductController::class, 'export']);

Route::post('brand/import', [BrandController::class, 'import']);
Route::get('brand/export', [BrandController::class, 'export']);

Route::post('category/import', [CategoryController::class, 'import']);
Route::get('category/export', [CategoryController::class, 'export']);


Route::get('units/export', [UnitController::class, 'export']);
Route::post('units/import', [UnitController::class, 'import']);

Route::get('tag/export', [TagController::class, 'export']);
Route::post('tag/import', [TagController::class, 'import']);

Route::get('product-sales/export', [ProductSaleController::class, 'export']);
Route::post('product-sales/import', [ProductSaleController::class, 'import']);

//END ROUTE API IMPORT/EXPORT
//-----------------------------------------------------------------------
//BEGIN ROUTE API AUTHENCATION
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login-admin', [AuthController::class, 'loginAdmin']);
    Route::post('login-client', [AuthController::class, 'loginClient']);

    Route::middleware('auth:api')->group(function () {
        Route::get('profile', [AuthController::class, 'profile']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('update', [AuthController::class, 'updateProfile']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });
});


Route::middleware('auth:api')->group(function () {
    Route::prefix('cart')->group(function () {
        Route::post('/add', [CardController::class, 'addItem']);
        Route::get('/', [CardController::class, 'getCart']);
        Route::patch('/update/{item}', [CardController::class, 'updateItemQuantity']);
        Route::delete('/remove/{item}', [CardController::class, 'removeItem']);
    });
});

Route::middleware('auth:api')->group(function () {
    Route::post('/place-order', [OrderController::class, 'placeOrder']);
    Route::post('/vnpay-return', [OrderController::class, 'handleVnpayReturn']);
});


Route::middleware('auth:api')->group(function () {
    Route::prefix('user-addresses')->group(function () {
        Route::post('/', [UserAddressController::class, 'store']);
        Route::put('/{id}', [UserAddressController::class, 'update']);
        Route::delete('/{id}', [UserAddressController::class, 'destroy']);
    });
});


//END ROUTE API AUTHENCATION
//-------------------------------------------------------------------------
//BEGIN ROUTE API CLEINT
Route::get('/product/tag/{id}', [GetProductForClient::class, 'getByTag']);
Route::get('/product/best-seller', [GetProductForClient::class, 'getBestSellerProduct']);
Route::get('/product/sale', [GetProductForClient::class, 'getSaleProduct']);

Route::get('/products/brand/{id}', [GetProductForClient::class, 'getByBrand']);
Route::get('/products/category/{id}', [GetProductForClient::class, 'getByCategory']);

Route::get('/products/category/{categoryId}/brand/{brandId}/exclude/{excludeProductId?}', [GetProductForClient::class, 'getByCategoryAndBrand']);

Route::get('/category-parent', [CategoryController::class, 'getCategoryParent']);

Route::get('/product/search', [GetProductForClient::class, 'searchByName']);

//END ROUTE API CLIENT


Route::post('/vnpay', [VnpayController::class, 'createPayment']);

Route::get('/revenue/monthly', [RevenueController::class, 'monthlyRevenue']);
Route::get('/profit', [RevenueController::class, 'getTotalProfit']);
Route::get('/low-stock-products', [ProductStoreController::class, 'getLowStockProducts']);
Route::get('/order-item-statistics', [ProductStoreController::class, 'getOrderItemStatistics']);






// Facebook OAuth routes
Route::prefix('auth/facebook')->group(function () {
    Route::get('redirect', [FacebookController::class, 'redirectToFacebook']);
    Route::get('callback', [FacebookController::class, 'handleFacebookCallback']);
});

// Google OAuth routes
Route::prefix('auth/google')->group(function () {
    Route::get('redirect', [GoogleController::class, 'redirectToGoogle']);
    Route::get('callback', [GoogleController::class, 'handleGoogleCallback']);
    Route::post('login', [GoogleController::class, 'loginWithGoogleToken']);
});

