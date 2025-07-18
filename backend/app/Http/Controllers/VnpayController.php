<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;

class VnpayController extends Controller
{
    public function createPayment(Request $request)
    {
        // VNPAY credentials
        $vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        $vnp_Returnurl = route('checkout.index');
        $vnp_TmnCode = "AJ4KQD2W"; // Merchant code at VNPAY
        $vnp_HashSecret = "OJ11IV3MSOYD1ODC1JIPPJHQSIE2ZUHI"; // Secret key

        // Transaction information
        $vnp_TxnRef = time(); // Transaction reference (unique per order)
        $vnp_OrderInfo = 'Thanh toán đơn hàng test'; // Order information
        $vnp_OrderType = 'other';
        $vnp_Amount = $request->input('amount') * 100; // Amount in VND (VNPAY expects amount in cents)
        $vnp_Locale = 'vn'; // Locale

        $vnp_IpAddr = $request->ip(); // Use Laravel's request to get IP

        // Prepare input data
        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => Carbon::now('Asia/Ho_Chi_Minh')->format('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        // Optional fields
        if (!empty($vnp_BankCode)) {
            $inputData['vnp_BankCode'] = $vnp_BankCode;
        } else {
            // Bỏ qua mã ngân hàng và để VNPAY tự động chọn
            unset($inputData['vnp_BankCode']);
        }


        // Sort parameters by key
        ksort($inputData);

        // Build the query string and hashdata for signature
        $queryString = "";
        $hashdata = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $queryString .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        // Remove trailing '&' from the query string
        $queryString = rtrim($queryString, '&');

        // Now calculate the secure hash using the secret key
        $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);

        // Append the secure hash to the query string
        $vnp_Url .= "?" . $queryString . "&vnp_SecureHash=" . $vnpSecureHash;

        // Return the payment URL or redirect
        return response()->json(['payment_url' => $vnp_Url]);
    }
}
