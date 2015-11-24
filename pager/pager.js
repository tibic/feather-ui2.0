/**
 # pager组件
 #
 # Options:
 	dom: 生成页码的容器
 	pageTotal: 页总数
 	perPage：显示的页的个数，如果总数大雨此参数，则会出现。。。来表示中间省略的野马
 	url：跳转的地址，组件会自动在该url后面追加&page=页码，默认为空，则需要绑定switch事件
 	first：是否显示首页按钮
 	last：是否显示尾页按钮
 	currentPage：初始化时的页码
 	currentPageClassName: 当前页码的类名
 	className：组件对象的雷鸣
 	pageClassName：各个页码的样式

 # Events:
	switch(pageIndex)：切换页码时触发

 # Api:
 　 pageTo(pageIndex)：跳转至第几页，该方法会触发switch事件
 */


;(function(window, factory){
if(typeof define == 'function'){
    //seajs or requirejs environment
    define(function(require, exports, module){
        return factory(
            require('../jquery/jquery.js'),
            require('../class/class.js')
        );
    });
}else{
    window.jQuery.featherUi = window.jQuery.featherUi || {};
    window.jQuery.featherUi.Pager = factory(window.jQuery || window.$, window.jQuery.featherUi.Class);
}
})(window, function($, Class){

return Class.$factory('pager', {
	initialize: function(opt){
		this.options = $.extend({
			dom: null,
			pageTotal: 0,	//整页数
			perPage: 10,	//显示几页
			url: '',		//url不为空，可直接跳转，而非调用callback
			first: true,	//显示首页
			last: true,		//显示最后一页
			currentPage: 1,	//当前页码
			currentPageClassName: 'ui-pager-current',	//当前页class
			className: '',
			pageClassName: ''	//页码class
		}, opt || {});

		this.init();
	},

	init: function(){
		var self = this, opt = self.options;

		if(opt.pageTotal == 0) return; 
		
		self.container = $('<ul class="ui-pager">').addClass(opt.className);
		self.dom = $(opt.dom).empty().append(self.container);
		
		self.index = parseInt(opt.currentPage);
		self.createPage();
		self.initEvent();
	},

	initEvent: function(){
		var self = this;

		self.container.delegate('a', 'click', function(){
			self.pageTo($(this).attr('data-page'));
		});
	},

	pageTo: function(i){
		var self = this, opt = self.options;

		self.index = i ? parseInt(i < 1 ? 1 : i > opt.pageTotal ? opt.pageTotal : i ) : self.index;
		self.createPage();
		self.trigger('switch', self.index);
	},

	createPage: function(){
		var self = this, res = self.getPageResult(), opt = self.options;

		self.container.empty();

		$.each(res, function(key, value){
			var _0 = value[0], _1 = value[1], $html;

			if(!_1){
				$html = $('<li>' + _0 + '</li>').addClass('ui-pager-point');
			}else if(_1 != self.index){
				$html = $('<li><a href="' + (opt.url ? opt.url + _1 : 'javascript:void(0);') + '" data-page="' + _1 + '">' + _0 + '</a></li>').addClass(value[2]);
			}else{  
				$html = $('<li>' + _1 + '</li>').addClass(opt.currentPageClassName);
			}

			$html.addClass(opt.pageClassName).appendTo(self.container);
		});
	},

	getPageResult: function(){
		var self = this, opt = self.options;
		var total = parseInt(opt.pageTotal), per = opt.perPage, index = this.index, start = 0, end = 0, middle = Math.ceil(per / 2), m = parseInt(per / 2);

		if(total < per){
			start = 1;
			end = total;
		}else{
			if(index <= middle){
				start = 1;
				end = per;
			}else if(index > middle){
				if(index + middle <= total){
					start = index - middle + 1;
					end = index + m;
				}else{
					start = total - per + 1;
					end = total;
				}
			}
		}

		var arr = [];

		if(index > 1){
			arr.push([opt.previous || '&lt;', index - 1, 'ui-pager-previous']);
		}

		if(opt.first){
			if(start > 2){
				arr.push(['1', 1]);
				arr.push(['&middot;&middot;&middot;']);
			}else if(start == 2){
				arr.push(['1', 1]);
			}
		}
		
		var i = start;

		while(i <= end) arr.push([i, i++]);

		if(opt.last){
			if(end < total - 1){
				arr.push(['&middot;&middot;&middot;']);
				arr.push([total, total]);
			}else if(end == total - 1){
				arr.push([total, total]);
			}
		}

		if(index < total){
			arr.push([opt.next || '&gt;', index + 1, 'ui-pager-next']);
		}

		return arr;
	}
});

});