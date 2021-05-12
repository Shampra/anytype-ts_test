import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Icon, Select, Input, IconObject, Tag } from 'ts/component';
import { commonStore, detailStore, dbStore, menuStore } from 'ts/store';
import { I, C, DataUtil } from 'ts/lib';
import arrayMove from 'array-move';
import { translate, Util } from 'ts/lib';
import { observer } from 'mobx-react';

interface Props extends I.Menu {};

const Constant = require('json/constant.json');
const $ = require('jquery');

@observer
class MenuFilterList extends React.Component<Props, {}> {
	
	constructor (props: any) {
		super(props);
		
		this.save = this.save.bind(this);
		this.onAdd = this.onAdd.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onSortEnd = this.onSortEnd.bind(this);
	};
	
	render () {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId, getView } = data;
		const view = getView();

		if (!view) {
			return null;
		};

		const filterCnt = view.filters.length;
		const filters = Util.objectCopy(view.filters || []).map((it: any) => {
			return { 
				...it, 
				relation: dbStore.getRelation(rootId, blockId, it.relationKey),
			};
		}).filter((it: any) => { return it.relation ? true : false; });

		for (let filter of view.filters) {
			const { relationKey, condition, value } = filter;
		};

		const relationOptions = this.getRelationOptions();

		const Handle = SortableHandle(() => (
			<Icon className="dnd" />
		));
		
		const Item = SortableElement((item: any) => {
			const relation = item.relation;
			const conditionOptions = DataUtil.filterConditionsByType(relation.format);
			const condition = conditionOptions.find((it: any) => { return it.id == item.condition; });

			let value = null;
			let list = [];
			let Item = null;

			switch (relation.format) {

				default:
					value = `“${item.value}”`
					break;

				case I.RelationType.Date:
					value = item.value !== null ? Util.date('d.m.Y', item.value) : 'empty';
					break;

				case I.RelationType.Checkbox:
					value = item.value ? 'checked' : 'unchecked';
					break;

				case I.RelationType.Tag:
				case I.RelationType.Status:
					list = (item.value || []).map((id: string, i: number) => { 
						return (relation.selectDict || []).find((it: any) => { return it.id == id; });
					});
					list = list.filter((it: any) => { return it && it.id; });

					if (list.length) {
						value = (
							<React.Fragment>
								{list.map((item: any, i: number) => {
									return <Tag {...item} key={item.id} className={DataUtil.tagClass(relation.format)} />;
								})}
							</React.Fragment>
						);
					} else {
						value = 'empty';
					};
					break;

				case I.RelationType.Object:
					Item = (item: any) => {
						return (
							<div className="element">
								<div className="flex">
									<IconObject object={item} />
									<div className="name">{item.name}</div>
								</div>
							</div>
						);
					};

					list = (item.value || []).map((it: string) => { 
						return detailStore.get(rootId, it, []);
					});
					list = list.filter((it: any) => { return !it._objectEmpty_; });

					value = (
						<React.Fragment>
							{list.map((item: any, i: number) => {
								return <Item key={i} {...item} />;
							})}
						</React.Fragment>
					);
					break;
			};

			if ([ I.FilterCondition.None, I.FilterCondition.Empty, I.FilterCondition.NotEmpty ].indexOf(item.condition) >= 0) {
				value = null;
			};

			return (
				<form id={'item-' + item.id} className="item">
					<Handle />
					<IconObject size={40} object={{ relationFormat: relation.format, layout: I.ObjectLayout.Relation }} />

					<div className="txt">
						<Select 
							id={[ 'filter', 'relation', item.id ].join('-')} 
							className="relation" 
							arrowClassName="light"
							options={relationOptions}
							value={item.relationKey} 
							onChange={(v: string) => { this.onChange(item.id, 'relationKey', v); }} 
						/>
						<div className="flex" onClick={(e: any) => { this.onMore(e, item.id); }}>
							<div className="condition grey">
								{condition.name}
							</div>
							{value ? (
								<div className="value grey">
									{value}
								</div>
							) : ''}
						</div>
					</div>

					<div className="buttons">
						<Icon className="more" onClick={(e: any) => { this.onMore(e, item.id); }} />
						<Icon className="delete" onClick={(e: any) => { this.onDelete(e, item.id); }} />
					</div>
				</form>
			);
		});
		
		const ItemAdd = SortableElement((item: any) => (
			<div className="item add" onClick={this.onAdd}>
				<Icon className="plus" />
				<div className="name">Add a filter</div>
			</div>
		));
		
		const List = SortableContainer((item: any) => {
			return (
				<div className="items">
					{filters.map((item: any, i: number) => (
						<Item key={i} {...item} id={i} index={i} />
					))}
					{!filters.length ? (
						<div className="item empty">
							<div className="inner">No filters applied to this view</div>
						</div>
					) : ''}
					<ItemAdd index={view.filters.length + 1} disabled={true} />
				</div>
			);
		});
		
		return (
			<List 
				axis="y" 
				lockAxis="y"
				lockToContainerEdges={true}
				transitionDuration={150}
				distance={10}
				onSortEnd={this.onSortEnd}
				useDragHandle={true}
				helperClass="isDragging"
				helperContainer={() => { return $(ReactDOM.findDOMNode(this)).get(0); }}
			/>
		);
	};
	
	componentDidMount () {
		const { getId } = this.props;
		const obj = $(`#${getId()} .content`);

		obj.unbind('click').on('click', () => {
			menuStore.closeAll(Constant.menuIds.cell);
		});
	};

	componentWillUnmount () {
		menuStore.closeAll(Constant.menuIds.cell);
	};

	getRelationOptions () {
		const { config } = commonStore;
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId, getView } = data;
		const view = getView();
		
		const relations = view.relations.filter((it: I.ViewRelation) => { 
			const relation = dbStore.getRelation(rootId, blockId, it.relationKey);
			if (!relation || (!config.debug.ho && relation.isHidden) || (relation.format == I.RelationType.File)) {
				return false;
			};
			return true;
		});

		let options: any[] = relations.map((it: I.ViewRelation) => {
			const relation = dbStore.getRelation(rootId, blockId, it.relationKey);
			return { 
				id: relation.relationKey, 
				name: relation.name, 
				isHidden: relation.isHidden,
				format: relation.format,
			};
		});

		options.sort(DataUtil.sortByName);
		return options;
	};
	
	onAdd (e: any) {
		const { param, getId } = this.props;
		const { data } = param;
		const { getView } = data;
		const view = getView();
		const relationOptions = this.getRelationOptions();

		if (!relationOptions.length) {
			return;
		};

		const obj = $(`#${getId()} .content`);
		const first = relationOptions[0];
		const conditions = DataUtil.filterConditionsByType(first.format);
		const condition = conditions.length ? conditions[0].id : I.FilterCondition.None;

		view.filters.push({ 
			relationKey: first.id, 
			operator: I.FilterOperator.And, 
			condition: condition as I.FilterCondition,
			value: DataUtil.formatRelationValue(first, null, false),
		});

		obj.animate({ scrollTop: obj.get(0).scrollHeight }, 50);
		this.save();
	};

	onDelete (e: any, id: number) {
		const { param } = this.props;
		const { data } = param;
		const { getView } = data;
		const view = getView();

		view.filters = view.filters.filter((it: any, i: number) => { return i != id; });
		this.save();

		menuStore.close('select');
	};

	onMore (e: any, id: number) {
		const { param, getId } = this.props;
		const { data } = param;

		menuStore.open('dataviewFilterValues', {
			element: `#${getId()} #item-${id}`,
			horizontal: I.MenuDirection.Center,
			data: {
				...data,
				save: this.save,
				itemId: id,
			}
		});
	};
	
	onSortEnd (result: any) {
		const { param } = this.props;
		const { data } = param;
		const { getView } = data;
		const view = getView();
		const { oldIndex, newIndex } = result;

		view.filters = arrayMove(view.filters, oldIndex, newIndex);
		this.save();
	};

	onChange (id: number, k: string, v: any) {
		const { param } = this.props;
		const { data } = param;
		const { rootId, blockId, getView } = data;
		const view = getView();

		let item = view.getFilter(id);
		if (!item) {
			return;
		};

		item = Util.objectCopy(item);
		item[k] = v;

		// Remove value when we change relation, filter non unique entries
		if (k == 'relationKey') {
			const relation = dbStore.getRelation(rootId, blockId, v);
			const conditions = DataUtil.filterConditionsByType(relation.format);

			item.condition = conditions.length ? conditions[0].id : I.FilterCondition.None;
			item.value = DataUtil.formatRelationValue(relation, null, false);

			view.filters = view.filters.filter((it: I.Filter, i: number) => { 
				return (i == id) || 
				(it.relationKey != v) || 
				((it.relationKey == v) && (it.condition != item.condition)); 
			});
		};

		view.setFilter(id, item);

		this.save();
		this.forceUpdate();
	};

	save () {
		const { param } = this.props;
		const { data } = param;
		const { getView, rootId, blockId, onSave } = data;
		const view = getView();

		C.BlockDataviewViewUpdate(rootId, blockId, view.id, view, (message: any) => {
			if (onSave) {
				onSave(message);
			};
			window.setTimeout(() => { this.forceUpdate(); }, 50);
		});
	};

};

export default MenuFilterList;