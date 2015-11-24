/**
 * Alert组件
 *
 * Options:
 *	 content: 显示内容
 *   callback：点击确认按钮后，执行的回调函数
 *   unclose：点击确认后，是否关闭，默认为false，即关闭
 *   opt: 同dialog组件
 * 
 * Events: 同dialog组件
 *
 * Api: 同dialog组件
 *
 * Example：
 *   var alert = Alert.alert('确定删除该微博么？', function(){
 *       console.log('点击了确认按钮');
 *   }, true);
 *
 *   console.log(alert) //dialog对象
 *
 *   alert.getButton('确定').click(function(){
 *		 console.log('直接在jquery上绑定的click事件触发了');
 *   });
 *
 *   alert.on('close', function(){console.log('alert关闭了')});
 * 
 */


;(function(window, factory){
if(typeof define == 'function'){
	//seajs or requirejs environment
	define(function(require, exports, module){
		return factory(
			require('../jquery/jquery.js'),
			require('../dialog/dialog.js')
		);
	});
}else{
	window.jQuery.featherUi = window.jQuery.featherUi || {};
	window.jQuery.featherUi.Alert = factory(window.jQuery || window.$, window.jQuery.featherUi.Dialog);
}
})(window, function($, Dialog){

return {
	alert: function(content, callback, unclose, opt){
		return new Dialog($.extend({
			title: '提示',
			width: 400,
			content: '<div class="ui2-alert">' + content + '</div>',
			autoOpen: true,
			buttons: {
				'确定': {
					events: {
						click: function(){
							callback && callback();
							!unclose && this.destroy();
						}
					},

					className: 'ui2-alert-button-confirm'
				}
			}
		}, opt || {}));
	},

	warn: function(content, callback, unclose, opt){
		return this.alert('<div class="ui2-alert-warn">' + content + '</div>', callback, unclose, opt);
	},

	error: function(content, callback, unclose, opt){
		return this.alert('<div class="ui2-alert-error">' + content + '</div>', callback, unclose, $.extend({
			title: '错误'
		}, opt || {}));
	},

	success: function(content, callback, unclose, opt){
		return this.alert('<div class="ui2-alert-success">' + content + '</div>', callback, unclose, $.extend({
			title: '操作成功'
		}, opt || {}));
	},
	/**
	 * 同浏览器默认的confirm 
	 * content：显示内容
	 * callback：确认后执行的函数
	 * unclose：点击确认后不关闭
	 * 
	 * 当unclose为true时 可手动执行close或者destory方法关闭弹窗
	 */
	confirm: function(content, callback, unclose, opt){
		return new Dialog($.extend({
			title: '提示',
			width: 400,
			content: '<div class="ui2-alert">' + content + '</div>',
			autoOpen: true,
			buttons: {
				'确定': {
					events: {
						click: function(){
							callback();
							!unclose && this.destroy();
						}
					},

					className: 'ui2-alert-button-confirm'
				},

				'取消': {
					events: {
						click: function(){
							this.destroy();
						}
					},

					className: 'ui2-alert-button-cancel'
				}
			}
		}, opt || {}));
	}
};

});