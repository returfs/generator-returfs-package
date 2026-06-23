<?php

namespace <%= vendorNamespace %>\<%= className %>;

use Illuminate\Support\ServiceProvider;

class <%= className %>ServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        // $this->loadRoutesFrom(__DIR__.'/../routes/channels.php');

        // $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

    }

    public function register()
    {
        // $this->app->register(EventServiceProvider::class);
    }
}
