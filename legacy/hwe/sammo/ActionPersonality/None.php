<?php
namespace sammo\ActionPersonality;
use \sammo\iAction;

class None implements iAction{
    use \sammo\DefaultAction;

    protected $id = -1;
    protected $name = '-';
    protected $info = '';
}