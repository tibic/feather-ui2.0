/**
 # droplist组件
 #
 # Options:
 	list：droplist中显示内容的key-value对象
	items: list的别名
	dom：一个select对象，直接和droplist建立绑定关系，droplist会自动获取select中所有的key-value对
	container：droplist的容器指定，默认为document.body
	width：指定一个宽度，如果为false，则自适应变化宽度
	height：指定一个高度，如果为false, 则按照标准高度显示
	hover：是否鼠标划过时，显示下拉列表，默认为true，如果为false，则使用click事件来控制
	defaultValue：默认值
	selectedClassName：选中时的样式

 # Events:
	open：打开dialog时触发
	close： 关闭dialog时触发
	select(key, value)：选择时触发

 # Api:
 　 open: 打开
    close: 关闭
    setList(list[, defaultValue, defaultKey])：手动设置一个list，list可以为一个jquery选择器表达式、dom对象，jquery对象或者key-value对
    setValue(value[, key])：设置一个值
    getValue()：设置当前值
    disable()：禁用
    enable(): 恢复使用
    destroy(): 摧毁对象
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
	window.jQuery.featherUi.DropList = factory(window.jQuery || window.$, window.jQuery.featherUi.Class);
}
})(window, function($, Class){

var DropList = Class.$factory('droplist', {
	initialize: function(opt){
		this.options = $.extend({
			items: {},
			list: null,
			dom: null,
			container: document.body,
			width: false,
			height: false,
			hover: true,
			defaultValue: null,
			selectedClassName: ''
		}, opt || {});

		this.init();
	},

	init: function(){
		var self = this, opts = self.options;

		self.value = '';

		self.wraper = $('<div class="ui-droplist"><i class="ui-droplist-arrow"></i></div>').appendTo(opts.container);
		self.select = $('<span class="ui-droplist-select"></span>').appendTo(self.wraper);
		self.list = $('<ul class="ui-droplist-list"></ul>').appendTo(self.wraper);

		self.dom = opts.dom ? $(opts.dom) : null;
		self.setList(opts.dom || opts.list || opts.items, opts.defaultValue);
		self.eid = $.now();
		self.isHide = true;

		self.initSize();
		self.initEvent();
	},

	initEvent: function(){
		var self = this, opts = self.options;

		if(self.options.hover){
			self.wraper.hover($.proxy(self.open, self), $.proxy(self.close, self));
		}else{
			self.select.click(function(){
				self.isHide ? self.open() : self.close();
			});
			self.wraper.click(function(e){
				e.stopPropagation();
			});

			$(document).on('click.' + self.eid, function(){
				!self.isHide && self.close();
			});
		}

		self.list.delegate('.ui-droplist-item', 'click', function(){
			var $this = $(this);
			var key = $this.attr('data-droplist-key'), value = $this.attr('data-droplist-value');

			self.close();
			self.trigger('select', [key, value]);
			self.setValue(value, key);
		});
	},

	open: function(){
		var self = this;

		if(!self.wraper.hasClass('ui-droplist-disabled')){
			self.wraper.addClass('ui-droplist-open');
			self.resetWidth();
			self.isHide = false;
			self.trigger('open');
		}
	},

	close: function(){
		var self = this;

		if(!self.wraper.hasClass('ui-droplist-disabled')){
			self.wraper.removeClass('ui-droplist-open');
			self.isHide = true;
			self.trigger('close');
		}
	},

	setList: function(list, defaultValue, defaultKey){
		var self = this, $dom;

		if(list.nodeType || list instanceof $ || typeof list == 'string'){
			$dom = $(list);
			list = self.dom2list(list);
		}

		self.list.html(DropList.createListHtml(list));
		self.initSize();

		self.dom && (!$dom || $dom[0] !== self.dom[0]) && self.resetDom(list);

		if(defaultValue){
			self.setValue(defaultValue, defaultKey);
		}else{
			var $first = $('.ui-droplist-item:first', self.list);
			self.setValue($first.attr('data-droplist-value'), $first.attr('data-droplist-key'));
		}
	},

	resetDom: function(list){
		this.dom.html(DropList.createDomHtml(list));
	},

	resetWidth: function(){
		var self = this;

		self.list.css('width', 'auto');
		self.wraper.add(self.list).css('width', self.options.width || self.list.width());
	},

	initSize: function(){
		var self = this, height = self.options.height;

		self.resetWidth();

		if(!height) return;

		height = parseInt(height);
		self.wraper.find('.ui-droplist-arrow').css('top', parseInt((height - DropList.ARROW_WIDTH)/2));
		self.wraper.css('height', height);
		self.wraper.find('.ui-droplist-select, .ui-droplist-group-label, .ui-droplist-item-txt').css('line-height', height + 'px');
		self.list.css('top', height);
	},

	setValue: function(value, key){
		var self = this;

		var $dom = self.list.find('[data-droplist-value="' + value + '"]');

		if($dom.length){
			var cn = self.options.selectedClassName;

			if(cn){
				self.list.find('.ui-droplist-item-txt').removeClass(cn);
				$dom.find('.ui-droplist-item-txt').addClass(cn);
			}
			
			if(!key){
				key = $dom.attr('data-droplist-key');
			}	
		}

		self.select.html(key);
		self.value = value;
		self.dom && self.dom.val(value);
	},

	getValue: function(){
		return this.value;
	},

	dom2list: function(dom, ungroup){
		var obj = {}, self = this;

		if(!ungroup){
			$('> optgroup', dom).each(function(){
				obj[$(this).attr('label')] = self.dom2list(this, true);
			});
		}

		$('> option', dom).each(function(){
			obj[$(this).html()] = this.value;
		});

		return obj;
	},

	disable: function(){
		var self = this;

		self.wraper.addClass('ui-droplist-disabled');
		self.dom && self.dom.attr('disabled', true);
	},

	enable: function(){
		var self = this;

		self.wraper.addClass('ui-droplist-disabled');
		self.dom && self.dom.removeAttr('disabled');
	},

	destroy: function(){
		var self = this;

		self.wraper.remove();
		$(document).off('click.' + self.eid);
		self.dom && (self.dom = null);
	}
});

DropList.createListHtml = function(list){
	var html = [];

	$.each(list, function(key, item){
		if(typeof item == 'object' && item){
			html.push('\
				<li class="ui-droplist-group">\
					<span href="javascript:;" class="ui-droplist-group-label">' + key + '</span>\
					<ul>' + DropList.createListHtml(item) + '</ul>\
				</li>'
			);
		}else{
			html.push('<li class="ui-droplist-item" data-droplist-key="' + key + '" data-droplist-value="' + item + '"><a href="javascript:;" class="ui-droplist-item-txt">' + key + '</a></li>');
		}
	});

	return html.join('');
};

DropList.createDomHtml = function(list){
	var html = [];

	$.each(list, function(key, item){
		if(typeof item == 'object' && item){
			html.push('<optgroup label="' + key + '">' + DropList.createDomHtml(item) + '</optgroup>');
		}else{
			html.push('<option value="' + item + '">' + key + '</option>');
		}
	});

	return html.join('');
};

DropList.ARROW_WIDTH = 5;

return DropList;

});