import * as React from 'react';
import $ from 'jquery';
import { observer } from 'mobx-react';
import { Icon, Title, Label, Input, IconObject, Error, ObjectName, Button, Tag } from 'Component';
import { I, C, S, U, J, translate, Preview, analytics, Action } from 'Lib';

interface State {
	error: string;
	cid: string;
	key: string;
};

const pageMainSettingsSpaceIndex = observer(class PopupSettingsSpaceIndex extends React.Component<I.PageSettingsComponent, State> {

	refName: any = null;

	state = {
		error: '',
		cid: '',
		key: '',
	};

	constructor (props: any) {
		super(props);

		this.onDashboard = this.onDashboard.bind(this);
		this.onType = this.onType.bind(this);
		this.onSelect = this.onSelect.bind(this);
		this.onUpload = this.onUpload.bind(this);
		this.onName = this.onName.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onClick = this.onClick.bind(this);
	};

	render () {
		const { error } = this.state;
		const space = U.Space.getSpaceview();
		const home = U.Space.getDashboard();
		const type = S.Record.getTypeById(S.Common.type);
		const buttons = this.getButtons();
		const participant = U.Space.getParticipant();
		const canWrite = U.Space.canMyParticipantWrite();
		const members = U.Space.getParticipantsList([ I.ParticipantStatus.Active ]);
		const maxIcons = 5;

		const Member = (item: any) => {
			const isCurrent = item.id == participant?.id;

			return (
				<div className="member" style={item.style} >
					<div className="side left">
						<IconObject size={48} object={item} />
						<div className="nameWrapper">
							<div className="memberName">
								<ObjectName object={item} />
								{isCurrent ? <div className="caption">({translate('commonYou')})</div> : ''}
							</div>
							{item.globalName ? <Label className="globalName" text={item.globalName} /> : ''}
						</div>

					</div>
					<div className="side right">
						<Label text={translate(`participantPermissions${item.permissions}`)} />
					</div>
				</div>
			);
		};

		return (
			<React.Fragment>
				<div className="spaceHeader">
					<IconObject
						id="spaceIcon"
						size={128}
						iconSize={128}
						object={{ ...space, spaceId: S.Common.space }}
						canEdit={canWrite}
						menuParam={{ horizontal: I.MenuDirection.Center }}
						onSelect={this.onSelect}
						onUpload={this.onUpload}
					/>

					{/*<Title text={space.name} />*/}

					<Input
						ref={ref => this.refName = ref}
						value={this.checkName(space.name)}
						onKeyUp={this.onName}
						placeholder={translate('defaultNamePage')}
						readonly={!canWrite}
					/>
				</div>

				{canWrite ? (
					<div className="membersIcons">
						{members.map((el, idx) => {
							if (idx < maxIcons) {
								return <IconObject key={idx} size={36} object={el} />;
							};
							return null;
						})}
						{members.length > maxIcons ? (
							<div className="membersMore">+{members.length - maxIcons}</div>
						) : ''}
					</div>
				) : ''}

				<div className="buttons">
					{buttons.map((el, idx) => (
						<div key={idx} id={U.Common.toCamelCase(`settingsSpaceButton-${el.id}`)} className="btn" onClick={e => this.onClick(e, el)}>
							<Icon className={el.icon} />
							<Label text={el.name} />
						</div>
					))}
				</div>

				<div className="sections">
					<Error text={error} />

					{canWrite ? (
						<div className="section sectionSpaceManager">
							<Label className="sub" text={translate(`popupSettingsSpaceIndexManageSpaceTitle`)} />
							<div className="sectionContent">

								<div className="item">
									<div className="sides">
										<div className="side left">
											<Title text={translate('commonHomepage')} />
											<Label text={translate('popupSettingsSpaceIndexHomepageDescription')} />
										</div>

										<div className="side right">
											<div id="empty-dashboard-select" className="select" onClick={this.onDashboard}>
												<div className="item">
													<div className="name">{home ? home.name : translate('commonSelect')}</div>
												</div>
												<Icon className="arrow black" />
											</div>
										</div>
									</div>
								</div>

								<div className="item">
									<div className="sides">
										<div className="side left">
											<Title text={translate('popupSettingsPersonalDefaultObjectType')} />
											<Label text={translate('popupSettingsPersonalDefaultObjectTypeDescription')} />
										</div>

										<div className="side right">
											<div id="defaultType" className="select" onClick={this.onType}>
												<div className="item">
													<div className="name">{type?.name || translate('commonSelect')}</div>
												</div>
												<Icon className="arrow black" />
											</div>
										</div>
									</div>
								</div>

							</div>
						</div>
					) : (
						<div className="membersList section">
							<Label className="sub" text={translate(`pageSettingsSpaceIndexSpaceMembers`)} />
							{members.map((el, idx) => (
								<Member {...el} key={idx} />
							))}
						</div>
					)}
				</div>

			</React.Fragment>
		);
	};

	componentDidMount (): void {
		this.init();
	};

	componentDidUpdate (): void {
		this.init();
	};

	componentWillUnmount(): void {
		S.Menu.closeAll([ 'select', 'searchObject' ]);
	};

	init () {
		const { cid, key } = this.state;
		const space = U.Space.getSpaceview();

		if (space.isShared && !cid && !key) {
			U.Space.getInvite(S.Common.space, (cid: string, key: string) => {
				if (cid && key) {
					this.setInvite(cid, key);
				};
			});
		};
	};

	setInvite (cid: string, key: string) {
		this.setState({ cid, key });
	};

	onDashboard () {
		U.Menu.dashboardSelect(`#${this.props.getId()} #empty-dashboard-select`);
	};

	onType (e: any) {
		const { getId } = this.props;

		S.Menu.open('typeSuggest', {
			element: `#${getId()} #defaultType`,
			horizontal: I.MenuDirection.Right,
			data: {
				filter: '',
				filters: [
					{ relationKey: 'recommendedLayout', condition: I.FilterCondition.In, value: U.Object.getPageLayouts() },
					{ relationKey: 'uniqueKey', condition: I.FilterCondition.NotEqual, value: J.Constant.typeKey.template },
				],
				onClick: (item: any) => {
					S.Common.typeSet(item.uniqueKey);
					analytics.event('DefaultTypeChange', { objectType: item.uniqueKey, route: analytics.route.settings });
					this.forceUpdate();
				},
			}
		});
	};

	onName (e: any, v: string) {
		C.WorkspaceSetInfo(S.Common.space, { name: this.checkName(v) });
	};

	onSelect (icon: string) {
		if (!icon) {
			C.WorkspaceSetInfo(S.Common.space, { iconImage: '' });
		};
	};

	onUpload (objectId: string) {
		C.WorkspaceSetInfo(S.Common.space, { iconImage: objectId });
	};

	onDelete () {
		Action.removeSpace(S.Common.space, 'Settings', (message: any) => {
			if (message.error.code) {
				this.setState({ error: message.error.description });
			};
		});
	};

	onClick (e: React.MouseEvent, item: any) {
		const { cid, key } = this.state;

		switch (item.id) {
			case 'invite': {
				this.props.onPage('spaceShare');
				break;
			};
			case 'qr': {
				S.Popup.open('inviteQr', { data: { link: U.Space.getInviteLink(cid, key) } });
				break;
			};
			case 'more': {
				const element = `#${U.Common.toCamelCase(`settingsSpaceButton-${item.id}`)}`;
				S.Menu.open('select', {
					element,
					offsetX: 16,
					offsetY: -40,
					onOpen: () => {
						$(element).addClass('hover');
					},
					onClose: () => {
						$(element).removeClass('hover');
					},
					data: {
						options: [
							{ id: 'spaceInfo', name: translate('popupSettingsSpaceIndexSpaceInfoTitle') },
							{ id: 'delete', name: translate('pageSettingsSpaceDeleteSpace'), color: 'red' },
						],
						onSelect: (e: React.MouseEvent, option: any) => {
							switch (option.id) {
								case 'spaceInfo': {
									this.onSpaceInfo();
									break;
								};
								case 'delete': {
									this.onDelete();
									break;
								};
							};
						},
					}
				});
				break;
			};
		};
	};

	onSpaceInfo () {
		const { account } = S.Auth;
		const space = U.Space.getSpaceview();
		const creator = U.Space.getCreator(space.targetSpaceId, space.creator);
		const data = [
			[ translate(`popupSettingsSpaceIndexSpaceIdTitle`), space.targetSpaceId ],
			[ translate(`popupSettingsSpaceIndexCreatedByTitle`), creator.globalName || creator.identity ],
			[ translate(`popupSettingsSpaceIndexNetworkIdTitle`), account.info.networkId ],
			[ translate(`popupSettingsSpaceIndexCreationDateTitle`), U.Date.dateWithFormat(S.Common.dateFormat, space.createdDate) ],
		];

		S.Popup.open('confirm', {
			className: 'isWide spaceInfo',
			data: {
				title: translate('popupSettingsSpaceIndexSpaceInfoTitle'),
				text: data.map(it => `<dl><dt>${it[0]}:</dt><dd>${it[1]}</dd></dl>`).join(''),
				textConfirm: translate('commonCopy'),
				colorConfirm: 'blank',
				canCancel: false,
				onConfirm: () => {
					U.Common.copyToast(translate('libKeyboardTechInformation'), data.map(it => `${it[0]}: ${it[1]}`).join('\n'));
				},
			}
		});
	};

	checkName (v: string): string {
		if ([ 
			translate('defaultNameSpace'), 
			translate('defaultNamePage'),
		].includes(v)) {
			v = '';
		};
		return v;
	};

	getButtons () {
		return [
			{ id: 'invite', name: translate('pageSettingsSpaceIndexInvitePeople'), icon: 'invite' },
			{ id: 'qr', name: translate('pageSettingsSpaceIndexQRCode'), icon: 'qr' },
			{ id: 'more', name: translate('commonMore'), icon: 'more' },
		];
	};

});

export default pageMainSettingsSpaceIndex;
