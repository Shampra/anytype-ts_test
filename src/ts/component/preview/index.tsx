import React, { forwardRef, useState, useEffect, MouseEvent } from 'react';
import $ from 'jquery';
import { observer } from 'mobx-react';
import { PreviewLink, PreviewObject, PreviewDefault } from 'Component';
import { I, S, U, Preview, Mark, translate, Action } from 'Lib';

const OFFSET_Y = 8;
const BORDER = 12;

const PreviewIndex = observer(forwardRef(() => {
	
	const { preview } = S.Common;
	const { type, target, object: initialObject, marks, range, noUnlink, noEdit, x, y, width, height, onChange } = preview;
	const [ object, setObject ] = useState(initialObject || {});
	const cn = [ 'previewWrapper' ];
	const win = $(window);

	const onClick = (e: MouseEvent) => {
		if (e.button) {
			return;
		};

		switch (type) {
			case I.PreviewType.Link: {
				Action.openUrl(target);	
				break;
			};

			case I.PreviewType.Default:
			case I.PreviewType.Object: {
				U.Object.openEvent(e, object);
				break;
			};
		};
	};
	
	const onCopy = () => {
		U.Common.copyToast(translate('commonLink'), target);
		Preview.previewHide(true);
	};
	
	const onEdit = (e) => {
		e.preventDefault();
		e.stopPropagation();

		const mark = Mark.getInRange(marks, I.MarkType.Link, range);
		const rect = U.Common.objectCopy($('#preview').get(0).getBoundingClientRect());

		S.Menu.open('blockLink', {
			rect: rect ? { ...rect, height: 0, y: rect.y + win.scrollTop() } : null, 
			horizontal: I.MenuDirection.Center,
			onOpen: () => Preview.previewHide(true),
			data: {
				filter: mark ? mark.param : '',
				type: mark ? mark.type : null,
				onChange: (type: I.MarkType, param: string) => {
					onChange(Mark.toggleLink({ type, param, range }, marks));
				}
			}
		});
	};
	
	const onUnlink = () => {
		onChange(Mark.toggleLink({ type: getMarkType(), param: '', range }, preview.marks));
		Preview.previewHide(true);
	};

	const getMarkType = () => {
		switch (type) {
			case I.PreviewType.Link: {
				return I.MarkType.Link;
			};

			case I.PreviewType.Default:
			case I.PreviewType.Object: {
				return I.MarkType.Object;
			};
		};
	};

	const position = () => {
		const obj = $('#preview');
		const poly = obj.find('.polygon');
		const { ww, wh } = U.Common.getWindowDimensions();
		const st = win.scrollTop();
		const ow = obj.outerWidth();
		const oh = obj.outerHeight();
		const css: any = { opacity: 0, left: 0, top: 0 };
		const pcss: any = { top: 'auto', bottom: 'auto', width: '', left: '', height: height + OFFSET_Y, clipPath: '' };

		let typeY = I.MenuDirection.Bottom;		
		let ps = (1 - width / ow) / 2 * 100;
		let pe = ps + width / ow * 100;
		let cpTop = 'polygon(0% 0%, ' + ps + '% 100%, ' + pe + '% 100%, 100% 0%)';
		let cpBot = 'polygon(0% 100%, ' + ps + '% 0%, ' + pe + '% 0%, 100% 100%)';
		
		if (ow < width) {
			pcss.width = width;
			pcss.left = (ow - width) / 2;
			ps = (width - ow) / width / 2 * 100;
			pe = (1 - (width - ow) / width / 2) * 100;
			
			cpTop = 'polygon(0% 100%, ' + ps + '% 0%, ' + pe + '% 0%, 100% 100%)';
			cpBot = 'polygon(0% 0%, ' + ps + '% 100%, ' + pe + '% 100%, 100% 0%)';
		};

		if (y + oh + height >= st + wh) {
			typeY = I.MenuDirection.Top;
		};
		
		if (typeY == I.MenuDirection.Top) {
			css.top = y - oh - OFFSET_Y;
			css.transform = 'translateY(-5%)';
				
			pcss.bottom = -height - OFFSET_Y;
			pcss.clipPath = cpTop;
		};
			
		if (typeY == I.MenuDirection.Bottom) {
			css.top = y + height + OFFSET_Y;
			css.transform = 'translateY(5%)';
				
			pcss.top = -height - OFFSET_Y;
			pcss.clipPath = cpBot;
		};
			
		css.left = x - ow / 2 + width / 2;
		css.left = Math.max(BORDER, css.left);
		css.left = Math.min(ww - ow - BORDER, css.left);

		obj.show().css(css);

		if (!preview.noAnimation) {
			obj.addClass('anim');
		};

		poly.css(pcss);
		window.setTimeout(() => { obj.css({ opacity: 1, transform: 'translateY(0%)' }); }, 15);
	};

	let head = null;
	let content = null;

	const unlink = <div id="button-unlink" className="item" onClick={onUnlink}>{translate('commonUnlink')}</div>;
	const props = {
		rootId: target,
		url: target,
		object,
		size: I.PreviewSize.Small,
		setObject,
		position,
	};

	switch (type) {
		case I.PreviewType.Link: {
			head = (
				<div className="head">
					<div id="button-copy" className="item" onClick={onCopy}>{translate('commonCopyLink')}</div>
					{!noEdit ? <div id="button-edit" className="item" onClick={onEdit}>{translate('previewEdit')}</div> : ''}
					{!noUnlink ? unlink : ''}
				</div>
			);

			content = <PreviewLink {...props} />;
			break;
		};

		case I.PreviewType.Object: {
			if (!noUnlink) {
				head = <div className="head">{unlink}</div>;
			};

			content = <PreviewObject {...props} />;
			break;
		};

		case I.PreviewType.Default: {
			if (!noUnlink) {
				head = <div className="head">{unlink}</div>;
			};

			content = <PreviewDefault {...props} />;
			break;
		};
	};

	if (head) {
		cn.push('withHead');
	};

	useEffect(() => {
		if (initialObject) {
			setObject(initialObject);
		};

		position();
	});

	return (
		<div id="preview" className={cn.join(' ')}>
			<div className="polygon" onClick={onClick} />
			<div className="content">
				{head}

				<div onClick={onClick}>{content}</div>
			</div>
		</div>
	);

}));

export default PreviewIndex;