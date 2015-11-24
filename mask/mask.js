/**
 # mask组件
 #
 # Options:
 	dom: mask的容器，默认为document.body
 	autoOpen：是否自动打开
 	color：背景色，默认#000
 	opacity：透明度，默认0.6

 # Events:
	open：打开mask时触发
	close： 关闭mask时触发

 # Api:
 　 open: 打开
    close: 关闭
    destroy：删除对象
    resetPosition：重新调整位置
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
	window.jQuery.featherUi = window.jQuery.FeatherUi || {};
    window.jQuery.featherUi.Mask = factory(window.jQuery || window.$, window.jQuery.featherUi.Class);
}
})(window, function($, Class){
var doc = document;

return Class.$factory('mask', {
	initialize: function(opt){
		this.options = $.extend({
			autoOpen: true,
			dom: doc.body,
			color: '#000',
			opacity: 0.6
		}, opt || {});

		this.init();
	},

	init: function(){
		var self = this, container = self.container = $(self.options.dom);

		self.eid = $.now();

		if(container[0] != doc.body){
			!/fixed|absolute/.test(container.css('position')) && container.css('position', 'relative');
		}
		
		self.mask = $('<div class="ui2-mask">').hide().css({
			backgroundColor: self.options.color,
			opacity: self.options.opacity
		}).appendTo(self.container);

		$(window).on('resize.' + self.eid, function(){
			self.resetPosition();
		});

		self.options.autoOpen && self.open();
	},

	open: function(){
		this.resetPosition();
		this.mask.show();
		this.trigger('open');
	},

	close: function(){
		this.mask.hide();
		this.trigger('close');
	},

	resetPosition: function(){
		var container = this.container[0];

		this.mask.css({
			width: container.scrollWidth || doc.docElement.scrollWidth,
			height: container.scrollHeight || doc.docElement.scrollHeight
		});
	},

	destroy: function(){
		this.mask.remove();	
		this.mask = null;
		$(window).off('resize.' + this.eid);
	}
});

});