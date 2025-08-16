import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { Label, Icon, IconObject, Tag } from 'Component';
import { I, C, S, U, J, Relation, Action, analytics, translate } from 'Lib';

interface WidgetPropertyRefProps {
	updateData: () => void;
	resize: () => void;
};

const WidgetProperty = observer(forwardRef<WidgetPropertyRefProps, I.WidgetComponent>((props, ref) => {

	const { block, parent, isPreview, getLimit, onContext, onCreate } = props;
	const [ dummy, setDummy ] = useState(0);
	const nodeRef = useRef(null);

	// The relationKey will be passed in the block's content.
	// This will be set up in step 5 of the plan.
	const { relationKey } = block.content as any;

	const relation = S.Record.getRelationByKey(relationKey);

	const getValues = () => {
		if (!relation) {
			return [];
		}

		// 1. Get all objects
		const allObjects = S.Record.getRecords(S.Record.getSubId(J.Constant.subId.allObject, ''));

		// 2. Get all values for the relation from all objects
		let allValueIds = [];
		allObjects.forEach(obj => {
			const value = obj[relationKey];
			const valueIds = Relation.getArrayValue(value);
			allValueIds.push(...valueIds);
		});

		// 3. Get unique value IDs
		const uniqueValueIds = U.Common.arrayUnique(allValueIds);

		// 4. Get option details for each unique value ID
		const options = uniqueValueIds.map(id => S.Record.getOption(id)).filter(it => it && !it._empty_);

		// 5. Sort alphabetically
		options.sort((a, b) => a.name.localeCompare(b.name));

		return options;
	};

	const values = getValues();
	const limit = getLimit(parent.content);
	const displayValues = values.slice(0, limit);

	const updateData = () => {
		setDummy(d => d + 1);
	};

	const resize = () => {
		// Can be implemented later if needed
	};

	const onValueClick = (e: MouseEvent, option: any) => {
		e.stopPropagation();

		const queryName = `Property: ${relation.name}`;
		const allSets = S.Record.getRecords(S.Record.getSubId(J.Constant.subId.allObject, '')).filter(o => o.layout === I.ObjectLayout.Set && o.name === queryName);

		const openSet = (setId) => {
			U.Object.openAuto({
				id: setId,
				layout: I.ObjectLayout.Set,
				_routeParam_: {
					tempFilter: {
						relationKey: relation.relationKey,
						condition: I.FilterCondition.In,
						value: [option.id],
					}
				}
			});
			analytics.event('ClickWidgetPropertyValue');
		};

		if (allSets.length > 0) {
			openSet(allSets[0].id);
		} else {
			// Create the set if it doesn't exist
			const details = {
				name: queryName,
				layout: I.ObjectLayout.Set,
			};
			C.ObjectCreate(details, [], '', S.Record.getSetType().uniqueKey, S.Common.space, (message: any) => {
				if (!message.error.code) {
					const newSet = message.details;
					// Now we need to add a dataview to the set
					const dataviewBlock = {
						type: I.BlockType.Dataview,
						content: {},
					};
					C.BlockCreate(newSet.id, '', I.BlockPosition.Bottom, dataviewBlock, (dvMessage: any) => {
						if (!dvMessage.error.code) {
							openSet(newSet.id);
						}
					});
				}
			});
		}
	};

	useImperativeHandle(ref, () => ({
		updateData,
		resize,
	}));

	useEffect(() => {
		updateData();
	}, [relationKey]);


	if (!relation) {
		return (
			<div ref={nodeRef} id="innerWrap" className="innerWrap">
				<div className="emptyWrap">
					<Label className="empty" text={translate('widgetErrorRelationNotFound')} />
				</div>
			</div>
		);
	}

	if (!displayValues.length) {
		return (
			<div ref={nodeRef} id="innerWrap" className="innerWrap">
				<div className="emptyWrap">
					<Label className="empty" text={translate('widgetEmptyLabel')} />
				</div>
			</div>
		);
	}

	return (
		<div ref={nodeRef} id="innerWrap" className="innerWrap">
			<div className="content">
				{displayValues.map(option => (
					<div key={option.id} className="item propertyItem" onClick={(e) => onValueClick(e, option)}>
						<Tag
							text={option.name}
							color={option.relationOptionColor}
							isFilled={true}
						/>
					</div>
				))}
			</div>
		</div>
	);
}));

export default WidgetProperty;
