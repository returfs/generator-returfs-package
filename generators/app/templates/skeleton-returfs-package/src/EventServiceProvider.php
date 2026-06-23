<?php

namespace <%= vendorNamespace %>\<%= className %>;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Returfs\Marketplace\External\Laravel\Items\Events\Contracts\CreateNewItemEventContract;
use Returfs\Marketplace\Internal\ItemCreateNew\Listeners\Item\User\CreateNewItemListener;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        CreateNewItemEventContract::class => [
            CreateNewItemListener::class,
        ],
    ];

    public function boot()
    {
        parent::boot();
    }
}
