/**
 # slider组件
 #
 # Options:
 	dom: 元素
 	time：动画时间长度
 	cps: 每次参与滚动的元素个数
 	maxIndex：最多滚动多少次
 	noGap：是否无缝
 	easing：jquery的运动动画
 	mode：指定滚动方式，horizontal表示水平 vertical表示垂直

 # Event：
 	before：滚动前执行
 	after：滚动后执行

 # Api:
 　 refresh：刷新元素结构，如果有新元素增加时，可使用该方法，刷新结构
 	to(index[, time])：滚动至某一元素
 	stop：停止滚动
 	pause：暂停滚动
 	resume：暂停后恢复
 	toNext：滚动下一个
 	toPrev：滚动上一个
 	toFirst：滚动至第一个
 	toLast：滚动至最后一个
 	isFirst：检查是否index是否为0
 	isLast：检查是否滚动至最大的index
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
	window.FeatherUi = window.FeatherUi || {};
	window.FeatherUi.Slider = factory(window.jQuery || window.$);
}
})(window, function($, Class){
var now = $.now;
//, Draggable = require('draggable');
var Slider = Class.$factory('slider', {
	initialize: function(opt) {
		this.options = $.extend({
			time: 1000,
			dom: null,
			cps: 1,
			maxIndex: 0,
			noGap: false,
			easing: null,
			mode: 'horizontal'
		}, opt || {});

		this.init();
	},

	init: function(){
		var self = this;
		self.index = 0;
		self.isRuning = false;
		self._start = 0;	//为了兼容日后的一个问题
		self.mode = Slider.getMode(self.options.mode);
		self.dom = $(self.options.dom);
		
		!/absolute|fixed/.test(self.dom.css('position')) && self.dom.css('position', 'relative');

		this.refresh();
	},

	refresh: function(){
		var self = this, opt = self.options, attr = Slider.DATA_CLONE;
		self.children = self.dom.children().filter(function(){
			return this.getAttribute(attr) == null;
		});

		if(opt.noGap){
			self.dom.children('[' +  attr + ']').remove();

			var $clone = self.children.clone().prependTo(self.dom).attr(attr, '');
			$clone.clone().appendTo(self.dom);

			self._start = self.children.length;
		}

		self.max = self.getMaxIndex();
		self.count = self.max + 1;
		self.all = self.dom.children();
		self._startPosition = self.getTargetValue(0, true);
		self.dom.css(self.mode, self.getTargetValue(self.index));
	},

	to: function(index, time, uncheck){
		var self = this;

		if(self.isRuning || !uncheck && self.index == index) return;

		if(!self.options.noGap){
			if(index < 0 || index > self.max) return;

			self.start(self.index = index, time);
		}else{
			self._index = index;
			self.index = index % self.count;

			if(self.index < 0){
				self.index = self.count + index;
			}

			self.start(index, time);
		}
	},

	start: function(index, time){
		var self = this, opt = self.options, obj = {};

		obj[self.mode] = self.getTargetValue(index);

		self.isRuning = true;
		self.trigger('before');

		self._duration = time || opt.time;
		self._startTime = now();
		self.dom.animate(obj, self._duration, opt.easing, function(){
			if(index != self.index){
				self.dom.css(self.mode, self.getTargetValue(self.index));
			}
			
			self.isRuning = false;
			self.trigger('after');
		});
	},

	stop: function(){
		this.dom.stop();
		this.isRuning = false;
	},

	pause: function(){
		this._endTime = now();
		this.stop();
	},

	resume: function(){
		var self = this, time;

		time = Math.max(1, self._duration - (self._endTime - self._startTime));
		self.start(self.options.noGap ? self._index : self.index, time);
	},

	toNext: function(){
		this.to(this.index + 1);
	},

	toPrev: function(){
		this.to(this.index - 1);
	},

	toFirst: function(){
		this.to(0);
	},

	toLast: function(){
		this.to(this.max);
	},

	isFirst: function(){
		return this.index == 0;
	},

	isLast: function(){
		return this.index == this.max;
	},

	getMaxIndex: function(){
		var self = this, opts = self.options;

		return !opts.noGap && opts.maxIndex ? opts.maxIndex : Math.ceil(self.children.length / self.options.cps) - 1;
	},

	getChildren: function(index, noGap){
		var self = this;
		return self.all.eq((noGap ? 0 : self._start) + index * self.options.cps);
	},

	getTargetValue: function(index, noGap){
		var self = this;
		return -self.getChildren(index, noGap).position()[self.mode] - (self._startPosition || 0);
	}
});

$.extend(Slider, {
	DATA_CLONE: 'data-slider-clone',

	getMode: function(mode){
		return mode == 'horizontal' ? 'left' : 'top';
	}
});

return Slider;

});