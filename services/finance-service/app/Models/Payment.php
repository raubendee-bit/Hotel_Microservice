<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';

    protected $fillable = [
        'invoice_id',
        'amount',
        'payment_method', // Credit Card, Check, Cash
        'transaction_reference'
    ];
}
