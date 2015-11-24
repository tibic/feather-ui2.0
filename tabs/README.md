Tabs
=================================

##Options:

* dom：指定tabs的父级元素
* selecter: 指定一个选择表达式，dom下所有符合该表达式的元素将会被收集,默认为 '> *'
* attr: 指定收集target id的属性，默认为href，如：<a href="#target1">target1的按钮</a>
* currentClass: 当前被选中的tab的className
* currentIndex: 指定一个当前索引
* event: 指定一个触发切换的事件，默认为click，可以指定mouseover等

##Event:

* switch(index)：切换时触发

###API

* tabTo(index)：切换至某一项
* refresh(): 当tabs结构有改动时，可执行refresh方法，进行刷新，重新初始化
