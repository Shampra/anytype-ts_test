import { I, keyboard } from 'ts/lib';
import { getRange, setRange } from 'selection-ranges';

const $ = require('jquery');

class Focus {
	
	focused: string = '';
	range: I.TextRange = { from: 0, to: 0 };
	
	set (id: string, range: I.TextRange): void {
		if (!id || !range) {
			return;
		};
		
		this.focused = String(id || '');
		this.range.from = Number(range.from) || 0;
		this.range.to = Number(range.to) || 0;
	};
	
	clear (withRange: boolean) {
		const el = $('.focusable.c' + this.focused);
		
		this.focused = '';
		this.range.from = 0;
		this.range.to = 0;
		
		if (withRange) {
			window.getSelection().empty();
			window.focus();
		};
		
		$('.focusable.isFocused').removeClass('isFocused');
		
		if (!el.length || el.hasClass('value')) {
			keyboard.setFocus(false);
		};
	};
	
	apply () {
		if (!this.focused) {
			return;
		};
		
		const node = $('.focusable.c' + this.focused);
		if (!node.length) {
			return;
		};
		
		$('.focusable.isFocused').removeClass('isFocused');
		node.addClass('isFocused');
		
		const el = node.get(0);
		
		el.focus();
		
		if (node.hasClass('input')) {
			el.setSelectionRange(this.range.from, this.range.to);
		} else
		if (node.attr('contenteditable')) {
			keyboard.setFocus(true);
			setRange(el, { start: this.range.from, end: this.range.to });
		};
	};
	
	scroll () {
		if (!this.focused) {
			return;
		};
		
		const node = $('.focusable.c' + this.focused);
		if (!node.length) {
			return;
		};
		
		const win = $(window);
		const top = win.scrollTop();
		const wh = win.height();
		const y = node.offset().top;
		
		if (y >= top + wh - 100) {
			$('html, body').animate({ scrollTop: y - wh + 100 }, 150);
		};
	};
	
};

export let focus: Focus = new Focus();