import { I, C, M } from 'Lib';

class UtilLayout {
	create (rootId: string, targetId: string, position: I.BlockPosition, columns: number, replace: boolean) {
		const layoutRow = new M.Block({
			type: I.BlockType.Layout,
			content: {
				style: I.LayoutStyle.Row,
			},
		});

		C.BlockCreate(rootId, targetId, position, layoutRow, (message: any) => {
			if (message.error.code) {
				return;
			}

			if (replace) {
				C.BlockListDelete(rootId, [targetId]);
			}

			const rowId = message.blockId;
			for (let i = 0; i < columns; i++) {
				const layoutColumn = new M.Block({
					type: I.BlockType.Layout,
					content: {
						style: I.LayoutStyle.Column,
					},
				});

				C.BlockCreate(rootId, rowId, I.BlockPosition.Bottom, layoutColumn, (colMessage: any) => {
					if (colMessage.error.code) {
						return;
					}

					const columnId = colMessage.blockId;
					const textBlock = new M.Block({
						type: I.BlockType.Text,
						content: {
							style: I.TextStyle.Paragraph,
							text: '',
						},
					});
					C.BlockCreate(rootId, columnId, I.BlockPosition.Bottom, textBlock);
				});
			}
		});
	}
}

export default new UtilLayout();
