/**
 * dialog组件
 *
 * Options:
 *	 title: 标题，如果为false，则整个头部都不会显示
 *   container: 约束的容器
 *   dom：指定将某一个dom放置在dialog中
 *   content: 指定dialog中的内容
 *   url: 加载一个url显示在dialog中
 *   width: dialog宽度
 *   height：dialog高度，默认为false，自适应高度
 *   esc：是否按下ESC键关闭，默认false
 *   mask：是否背景遮罩，默认true
 *   autoOpen：是否创建后自动打开，默认false
 *   className: 为dialog指定一个className
 *   handle：触发打开dialog的元素
 *   buttons：dialog按钮组

 * Events:
 *   open：打开dialog时触发
 *   close： 关闭dialog时触发
 *   firstOpen：第一次打开时触发
 *
 * Api:
 *   setContent(html): 设置dialog的html格式内容
 *   setDom(dom): 将一个dom放置于dialog中
 *   load(url)：加载这个url的内容
 *   resetPosition(): 位置发生异常时，可执行，窗口大小改变和滚动页面时，会自动执行该方法
 *   setTitle(title): 设置title，同options.title
 *　 open: 打开
 *   close: 关闭
 *   destroy: 删除对象，如果dialog中的内容为一个dom，则此dom会自动释放于document.body中
 *   setButtons(buttonsObject): 设置dialog的按钮组，同options.buttons
 *   getButton(buttonName|buttonIndex): 获取到按钮组成员的jQuery对象
 *
 * Example:
 *   #bind event
 *   	$('#dialog').dialog().on('open', function(){console.log(123);});
 *
 *   #setButtons:
 *   	$('#dialog').dialog().setButtons({
 *			'确定': function(){
 *				alert('点击了确定');
 *			},
 *
 *			'取消': {
 *				//设置className
 *				className: 'cancel',
 *				events: {
 *					click: function(){
 *						alert('点击了取消按钮');
 *					},
 *
 *					mouseover: function(){
 *						alert('鼠标划过按钮');
 *					}
 *				}
 *			}
 *		});
 * 
 *   #getButton:
 *      $('#dialog').dialog().getButton('确定').click(function(){alert('绑定click事件')});
 *		$('#dialog').dialog().getButton(0).click(function(){alert('为确定再次绑定click事件')});
 #
 */

;(function(window, factory){
if(typeof define == 'function'){
	//seajs or requirejs environment
	define(function(require, exports, module){
		return factory(
			require('../jquery/jquery.js'),
			require('../class/class.js'),
			require('../mask/mask.js')
		);
	});
}else{
	window.jQuery.featherUi = window.jQuery.featherUi || {};
	window.jQuery.featherUi.Dialog = factory(window.jQuery || window.$, window.jQuery.featherUi.Class, window.jQuery.featherUi.Mask);
}
})(window, function($, Class, Mask){
var doc = document;

return Class.$factory('dialog', {
	initialize: function(opt){
		this.options = $.extend({
			title: '',
			container: doc.body,
			dom: null,
			width: 400,
			height: false,
			content: '',
			url: '',
			esc: false,	//ESC是否开启，ESC按下自动关闭
			mask: true,					//蒙版
			autoOpen: false,
			buttons: {},
			handle: null,				//指定打开和关闭dialog的元素
			className: ''
		}, opt || {});

		this.init();
	},

	init: function(){
		var self = this;

		self.firstOpenStatus = false;
		self.dom = null;
		self.domParent = null;

		var wraper = self.wraper = $(self.options.container);

		if(wraper[0] != doc.body){
			!/fixed|absolute/.test(wraper.css('position')) && wraper.css('position', 'relative');
		}

		self.create();
		self.options.autoOpen && setTimeout(function(){
			self.open();
		}, 0);
	},

	create: function(){
		var self = this;

		self.createMask();
		self.createContainer();
		self.initEvent();
	},

	initEvent: function(){
		var self = this, options = self.options;

		self.o2s(window, 'resize', function(){
			self.resetPosition();
		});

		if(options.handle){
			self.o2s(options.handle, 'click', function(){
				self.open();
			});
		}

		self.container.find('.ui2-dialog-close').click(function(){
			self.close();
		});

		if(self.options.esc){
			self.o2s(doc, 'keyup', function(e){
				//esc关闭
				if(e.keyCode == 27){
					self.close();
				}
			})
		}
	},

	//创建遮罩
	createMask: function(){
		if(!this.options.mask) return;

		this.mask = new Mask({autoOpen: false, container: this.wraper});
	},

	//创建内容部分
	//包括创建内容　按钮
	createContainer: function(){
		var self = this, options = self.options;
		var $container = self.container = $('<div class="ui2-dialog-container">').html([
			'<div class="ui2-dialog-content"></div>'
		].join('')).appendTo(self.wraper).addClass(options.className);

		$container.prepend([
			'<strong class="ui2-dialog-header">',
	    		'<a href="javascript:void(0);" class="ui2-dialog-close">&times;</a>',
	    		'<span class="ui2-dialog-title"></span>',
	    	'</strong>'
	    ].join(''));

		self.setTitle(options.title);
		self.createButtons();
		self.initContent();

		$container.css('width', options.width);
		$container.find('.ui2-dialog-content').css({
			height: options.height
		});
	},

	initContent: function(){
		var self = this, options = self.options;

		if(options.content){
			self.setContent(options.content);
		}else if(options.dom){
			self.setDom(options.dom);
		}else if(options.url){
			self.load(options.url);
		}
	},

	setContent: function(content){
		var self = this;

		self.releaseDom();
		self.container.find('.ui2-dialog-content').html(content);
		self.resetPosition();
	},

	setDom: function(dom){
		var self = this;

		self.releaseDom();
		self.dom = $(dom).show();
		self.domParent = self.dom.parent();
		self.container.find('.ui2-dialog-content').empty().append(self.dom);
		self.resetPosition();
	},

	load: function(url){
		var self = this;

		self.container.find('.ui2-dialog-content').load(url, function(){
			self.trigger('contentLoaded');
			self.resetPosition();
		});
	},

	//释放dom
	releaseDom: function(){
		var self = this;

		if(self.dom){
			self.domParent.append(self.dom);
			self.dom = null;
			self.domParent = null;
		}
	},

	createButtons: function(){
		var self = this;

		if($.isEmptyObject(self.options.buttons)) return;

		self.buttons = $('<div class="ui2-dialog-buttons">').appendTo(self.container);
		self.setButtons(self.options.buttons);
	},

	/**
	 *设置buttons组
     *buttons:
     	{
			'确定': function(){
 				alert('点击了确定');
 			},
 
 			'取消': {
 				//设置className
 			className: 'cancel',
			events: {
 					click: function(){
 						alert('点击了取消按钮');
 					},
 
 					mouseover: function(){
 						alert('鼠标划过按钮');
 					}
 				}
 			}
     	}
	 */
	setButtons: function(buttons){
		var self = this;

		self.buttons.empty();
		
		$.each(buttons, function(index, item){
			if($.isFunction(item)){
				item = {
					events: {
						click: item
					},

					className: ''
				};	
			}

			var $button = $('<a href="javascript:void(0);" class="ui2-dialog-button" data-dialog-button-name="' + index + '" />').text(index).addClass(item.className).appendTo(self.buttons);

			$.each(item.events, function(event, callback){
				$button.on(event, function(){
					callback.call(self, $button);
				});
			});
		});
	},

	getButton: function(name){
		var $buttons = this.buttons.find('.ui2-dialog-button');

		return typeof name == 'number' ? $buttons.eq(name) : $buttons.filter('[data-dialog-button-name="' + name + '"]');
	},

	//设置title，为false时，则头部会被隐藏掉
	setTitle: function(title){
		var $header = this.container.find('.ui2-dialog-header');
		$header.removeClass('ui2-dialog-header-nob').show();

		if(title === false){
			$header.hide();
		}else if(title == ''){
			$header.addClass('ui2-dialog-header-nob');
		}

		$header.find('.ui2-dialog-title').html(title);
	},

	resetPosition: function(){
		var self = this;

		self.mask && self.mask.resetPosition();

		var wraper = self.wraper[0], position;

		if(wraper === doc.body){
			position = 'fixed';
			wraper = window;
		}else{
			position = 'absolute';
		}

		self.container.css({
			left: parseInt(($(wraper).outerWidth() - self.container.outerWidth())/2),
			top: parseInt(($(wraper).outerHeight() - self.container.outerHeight())/2),
			position: position
		});
	},

	open: function(){
		var self = this, options = self.options;

		self.mask && self.mask.open();
		self.container.show();
		self.resetPosition();

		if(!self.firstOpenStatus){
			self.firstOpenStatus = true;
			self.trigger('firstOpen');
		}

		self.trigger('open');
	},

	close: function(){
		var self = this, options = self.options;

		self.mask && self.mask.close();
		self.container.hide();
		self.trigger('close');
	},

	destroy: function(){
		var self = this;

		self.mask && self.mask.destroy();
		self.mask = null;
		self.container.remove();
		self.container = null;
		self.ofs(window, 'resize');
		self.options.handle && self.ofs(self.options.handle, 'click');
		self.ofs(doc, 'keyup');
		self.releaseDom();
	}
});
});