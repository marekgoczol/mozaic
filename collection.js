$(function($){
	Mozaic = {
		config: {
			initialWidth: Math.floor($('.collection').width()/5),
			spacing: 2,
			collections_next: '',
			is_touch_device: 'ontouchstart' in document.documentElement
		},

		switch: function(elem) {
			var _this = this;
			if(elem.hasClass('zoomed')) {
				return;
			}
			var collection = elem.parents('.collection');
			if(_this.convertToNumber(elem.css('left')) > _this.convertToNumber(collection.css('width')) || _this.convertToNumber(elem.css('left')) < 0) {
				return;
			}
			if(collection.find('.zoomed').length == 0) {
				_this.zoom(elem, false, false);
				return;
			}

			var zoomed = collection.find('.zoomed');
			var forceRtl = (_this.convertToNumber(zoomed.css('left')) < _this.convertToNumber(elem.css('left')));
			var bottom = (_this.convertToNumber(elem.css('top')) > 0);

			_this.zoomOut(zoomed, bottom, forceRtl, elem);

		},

		convertToNumber: function(val) {
			val.replace('px', '');
			return parseInt(val);
		},


		motionLoop: function() {
			var _this = this;
			if(_this.config.collections_next != false && _this.config.collections_next instanceof jQuery) {
				if(_this.isAnimated(_this.config.collections_next)) {
					return;
				}
				if(_this.config.collections_next.hasClass('collection')) {
					_this.resetGrid(_this.config.collections_next);
				} else {
					_this.switch(_this.config.collections_next);
				}
				_this.config.collections_next = false;
				// setTimeout(motionLoop, motionLoopTimeout);
			}
		},

		isAnimated: function(elem) {
			if(elem.hasClass('item')) {
				elem = elem.parents('.collection');
			}

			if(elem.find(':animated').length > 0) {
				return true;
			} else {
				return false;
			}
		},

		zoomOut: function(target, bottom, rtl, zoomIn) {
			var _this = this;
			if(!target.hasClass('zoomed')) return;
			target.find('.label').fadeOut(100);
			var tileTwo,
				_left = _this.convertToNumber(target.css('left')),
				collection = target.parents('.collection'),
				closestTile = null,
				closestDistance = 0;
			collection.find('.item').each(function() {
				var left = Math.floor(_this.convertToNumber($(this).css('left'))),
					top = Math.floor(_this.convertToNumber($(this).css('top'))),
					distance = Math.abs(left - _left);
				if($(this).hasClass('zoomed')) return;
				else if(rtl && left < _left) return;
				else if(!rtl && left > _left) return;
				else if(bottom && top > 0) return;
				else if(!bottom && top == 0) return;
				else if(closestTile == null) {
					closestTile = $(this);
					closestDistance = distance;
				} else {
					if(distance < closestDistance) {
						closestTile = $(this);
						closestDistance = distance;
					}
				}
			});

			if(zoomIn != null) {

				if(closestTile != null) {
					var left = _this.convertToNumber(closestTile.css('left')),
						targetLeft = (rtl) ? left - 2 * (_this.config.initialWidth + _this.config.spacing) : left + 2 * (_this.config.initialWidth + _this.config.spacing);
					targetLeft = Math.floor(targetLeft);
					closestTile.delay(100).animate({
						left: targetLeft
					}, 400);
				}

			}

			var targetData = {
				width: _this.config.initialWidth,
				height: _this.config.initialWidth
			};

			if(!rtl) {
				targetData.left = _this.convertToNumber(target.css('left')) + _this.config.spacing + _this.config.initialWidth;
			}

			if(bottom) {
				targetData.top = _this.config.spacing + _this.config.initialWidth;
			}

			targetData.left = Math.floor(targetData.left);
			targetData.top = Math.floor(targetData.top);
			
			target.animate(targetData, 300);

			if(zoomIn != null) {
				_this.zoom(zoomIn, rtl, target);
			}

			target.removeClass('zoomed');
		},

		zoom: function(target, forceRtl, stopAt) {
			var _this = this;
			if(target.hasClass('zoomed')) return;
			var largeWidth = Math.floor(_this.config.initialWidth * 2 + _this.config.spacing),
				ltr = true,
				bottom = false,
				left = _this.convertToNumber(target.css('left')),
				top = _this.convertToNumber(target.css('top')),
				collection = target.parents('.collection');

			if(left + _this.config.initialWidth >= collection.css('width').replace('px', '') || forceRtl) {
				ltr = false;
			}

			if(top > 0) bottom = true;


			var targetData = { width: largeWidth, height: largeWidth };
			if(bottom) targetData.top = 0;
			if(!ltr) targetData.left = left - _this.config.initialWidth - _this.config.spacing;
			target.addClass('zoomed');
			target.delay(10).animate(targetData, 350, function() {
				$(this).find('.label').slideDown(500, function(){ 
					_this.motionLoop();
				});
			});

			collection.find('.item').each(function() {
				var item = $(this);
				if(item.hasClass('zoomed')) return;
				var _left = _this.convertToNumber(item.css('left')), 
					_bottom = _this.convertToNumber(item.css('top')) > 0;
				if(stopAt != false) {
					var __left = _this.convertToNumber(stopAt.css('left'));
					if(ltr && _left >= __left) return;
					else if(!ltr && _left <= __left) return;
				}
				if(ltr) {
					if(_this.convertToNumber(item.css('left')) > left + _this.config.initialWidth || _this.convertToNumber(item.css('left')) == left) {
						var newLeft = ((!bottom && _bottom) || (bottom && !_bottom)) ? _left + 2 * (_this.config.initialWidth + _this.config.spacing) : _left + (_this.config.initialWidth + _this.config.spacing);
						newLeft = Math.floor(newLeft);
						item.animate({
							left: newLeft
						}, 500, function(){ 
							_this.motionLoop();
						});
					}
				} else {
					var newLeft = ((!bottom && _bottom) || (bottom && !_bottom)) ? _left - 2 * (_this.config.initialWidth + _this.config.spacing) : _left - (_this.config.initialWidth + _this.config.spacing);
					newLeft = Math.floor(newLeft);
					if(_this.convertToNumber(item.css('left')) < left || _this.convertToNumber(item.css('left')) < left + _this.config.initialWidth) {
						item.animate({
							left: newLeft
						}, 500, function(){ 
							_this.motionLoop();
						});
					}
				}
			});	
		},

		resetGrid: function(collection) {
			if(collection.find('.zoomed').length == 0) return;
			var _this = this,
				rtl = false,
				countTop = 0,
				countBottom = 0,
				zoomed = collection.find('.zoomed'),
				_left = _this.convertToNumber(zoomed.css('left')),
				_top = _this.convertToNumber(zoomed.css('top'));

			collection.find('.item').each(function() {
				if($(this).hasClass('zoomed')) return;
				var left = _this.convertToNumber($(this).css('left')),
					top = _this.convertToNumber($(this).css('top'));
				if(left > _this.convertToNumber(collection.css('width'))) {
					rtl = true;
				}

				if(top > 0) {
					countBottom++;
				} else {
					countTop++;
				}
			});

			var bottom = (countTop > countBottom);

			collection.find('.item').each(function() {
				if($(this).hasClass('zoomed')) return;
				var left = _this.convertToNumber($(this).css('left')),
					top = _this.convertToNumber($(this).css('top'));

				if(rtl && left < _left) return;
				if(!rtl && left > _left) return;

				var targetData = new Object(),
					leftShift = _this.config.initialWidth + _this.config.spacing;
				if(rtl) leftShift *= -1;
				if((bottom && top == 0) || (!bottom && top > 0)) leftShift *= 2;
				targetData.left = left + leftShift;
				targetData.left = Math.floor(targetData.left);
				$(this).delay(200).animate(targetData, 500, function(){ 
					motionLoop();
				});
			});

			zoomOut(collection.find('.zoomed'), bottom, rtl);
		},


		initializeMozaic: function(target) {
			var _this = this;
			_this.config.initialWidth = Math.floor($('.collection').width()/5);

			$('.item').each(function(){
				$(this).css({'width':_this.config.initialWidth, 'height': _this.config.initialWidth });
			});

			$('.collection').css({
				height: Math.floor($('.item:first').height() * 2)
			});

			if(target.find('.item').length <= 7) {
				var count = 0,
					left = 0,
					top = 0,
					previous = null;
				target.find('.item').each(function() {

					if($(this).hasClass('main')) {
						$(this).css({
							left: left,
							top: 0,
							width: _this.config.initialWidth * 2 + _this.config.spacing,
							height: _this.config.initialWidth * 2 + _this.config.spacing
						});

						if(top > 0) {
							previous.css('left', left + _this.config.initialWidth * 2 + 2 * _this.config.spacing);
						}

						left += _this.config.initialWidth * 2 + 2 * _this.config.spacing;
						$(this).addClass('zoomed');
						$(this).find('.label').fadeIn();
					} else {
						$(this).css({
							left: left,
							top: top,
						});

						if(top > 0) {
							top = 0;
							left += _this.config.initialWidth + _this.config.spacing;
						} else {
							top = _this.config.initialWidth + _this.config.spacing;
						}
					}


					previous = $(this);
					count++;
					
				});
			} else if (target.find('.item').length <= 10) {
				var count = 0;
				target.find('.item').each(function() {
					var left = ((count) % 5) * _this.config.initialWidth;
					left += ((count) % 5) * _this.config.spacing;
					var top = (count > 4) ? _this.config.initialWidth + _this.config.spacing : 0;
					
					$(this).css({
						left: left,
						top: top
					});

					count++;
				});

				target.mouseleave(function(e) {
					if(isAnimated($(this))) {
						_this.config.collections_next = $(this);	
						return;
					} 

					_this.resetGrid($(this));
				});
			}

			if(_this.config.is_touch_device) {
				target.find('.item').on('click',function(e) {
					if(!$(this).hasClass('zoomed')){
						e.preventDefault();	
					}
					if(_this.isAnimated($(this))) {
						_this.config.collections_next = $(this);	
						return;
					}
					_this.switch($(this));
				});
			} else {
				target.find('.item').hoverIntent(function(e) {
					if(_this.isAnimated($(this))) {
						_this.config.collections_next = $(this);	
						return;
					}
					_this.switch($(this));
				}, function() {});	
			}
		}
	}
});


$(document).ready(function() {
	Mozaic.initializeMozaic($(this));
});

$(window).on('resize',function(){
 	Mozaic.initializeMozaic($('.collection'));
})