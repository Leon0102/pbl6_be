import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VnPayService {

    constructor(
        private readonly configService: ConfigService,
    ) {
    }
    async getPaymentUrl() {
        var date = new Date();

        var desc = 'Thanh toan don hang thoi gian: ' + new Date().toString();
        return {
            title: 'Tạo mới đơn hàng', amount: 10000, description: desc
        }
    }

    createPaymentUrl(dto: any) {
        // var ipAddr = req.headers['x-forwarded-for'] ||
        //     req.connection.remoteAddress ||
        //     req.socket.remoteAddress ||
        //     req.connection.socket.remoteAddress;

        var tmnCode = this.configService.get('vnp_TmnCode');
        var secretKey = this.configService.get('vnp_HashSecret');
        var vnpUrl = this.configService.get('vnp_Url');
        var returnUrl = this.configService.get('vnp_ReturnUrl');

        var date = new Date();

        // var createDate = dateFormat(date, 'yyyymmddHHmmss');
        // format createDate to yyyymmddHHmmss if hours length < 2 or minutes length < 2 or seconds length < 2 or month length < 2 or day length < 2 add 0 before

        var createDate = date.getFullYear().toString() + (date.getMonth() + 1).toString() + date.getDate().toString() + '0' + date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString();
        // format orderId to HHmmss
        var orderId = date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString();
        var amount = dto.amount;
        var bankCode = dto.bankCode;

        var orderInfo = dto.orderDescription;
        var orderType = dto.orderType;
        var locale = dto.language;
        if (locale === null || locale === '') {
            locale = 'vn';
        }
        var currCode = 'VND';
        var vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        // vnp_Params['vnp_Merchant'] = ''
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = orderType;
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = '13.160.92.202';
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = this.sortObject(vnp_Params);

        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        return {
            message: vnpUrl
        }
    }

    vnPayReturn(req: any) {
        var vnp_Params = req.query;

        var secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = this.sortObject(vnp_Params);

        var tmnCode = this.configService.get('vnp_TmnCode');
        var secretKey = this.configService.get('vnp_HashSecret');

        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

            return {
                message: 'success'
            }
        } else {
            return {
                message: 'fail'
            }
        }
    }

    vnPayIPN(req: any) {
        var vnp_Params = req.query;
        var secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = this.sortObject(vnp_Params);
        var secretKey = this.configService.get('vnp_HashSecret');
        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");


        if (secureHash === signed) {
            var orderId = vnp_Params['vnp_TxnRef'];
            var rspCode = vnp_Params['vnp_ResponseCode'];
            //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
            return { RspCode: '00', Message: 'success' }
        }
        else {
            return { RspCode: '97', Message: 'Fail checksum' }
        }
    }

    sortObject(obj) {
        var sorted = {};
        var str = [];
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }
}
