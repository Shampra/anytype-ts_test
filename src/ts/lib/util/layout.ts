import { I, C, M } from 'Lib';

class UtilLayout {
	create (rootId: string, targetId: string, columns: number, callBack: (rowId: string) => void) {
		const layoutRow = new M.Block({
			type: I.BlockType.Layout,
			content: {
				style: I.LayoutStyle.Row,
			},
		});

		C.BlockCreate(rootId, targetId, I.BlockPosition.Bottom, layoutRow, (message: any) => {
			if (message.error.code) {
				return;
			}
			const rowId = message.blockId;

			let createdColumns = 0;
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
					C.BlockCreate(rootId, columnId, I.BlockPosition.Bottom, textBlock, () => {
						createdColumns++;
						if (createdColumns === columns) {
							callBack(rowId);
						}
					});
				});
			}
		});
	}
}

export default new UtilLayout();
