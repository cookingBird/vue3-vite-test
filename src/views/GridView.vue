<template>
<div class="absolute space-x-2 name--button-group">
	<button
		v-for="btn in btns"
		:key="btn.label"
		@click="btn.onClick"
		class="p-1 border border-gray-500 rounded"
	>
		{{ btn.label }}
	</button>
</div>
<div
	class="relative w-full h-full p-2 border border-red-500 grid-container"
	:style="{
		'gridTemplateRows': `repeat(${rows},1fr)`,
		'gridTemplateColumns': `repeat(${cols},1fr)`
	}"
>
	<div
		ref="itemsRef"
		v-for="item, index in layout"
		:key="index"
		class="border border-blue-400 grid-item"
		:data-static="item.static"
		:data-select="item.select"
		:data-id="item.i"
		:style="{
			'grid-column-start': `span ${item.w}`,
			'grid-row-start': `span ${item.h}`,
		}"
		@click="selectItem(item)"
	>
		<slot
			name=content
			:data="item"
		>
			{{ item.i }}
		</slot>
	</div>
</div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, defineExpose } from 'vue';
import { useKeyModifier } from '@vueuse/core';
const btns = [
	{ label: '合并', onClick: () => { console.log('合并'); merge(); } },
	{ label: '拆分', onClick: () => { console.log('拆分'); split(); } },
	{ label: '删除', onClick: () => { console.log('删除') } },
];

const rows = ref(3);
const cols = ref(4);
const layout = ref([
	{ i: 0, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 1, w: 2, h: 2, static: true, select: false, position: null },
	{ i: 2, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 3, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 4, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 5, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 6, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 7, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 8, w: 1, h: 1, static: false, select: false, position: null }
]);

const colLayoutMap = {
	0: [0, 3, 5],
	3: [3, 5],
	2: [2, 4, 8],
	4: [4, 8],
};


const selected = computed(() => layout.value.filter(item => item.select));

const onControl = useKeyModifier('Control');

function selectItem(item: any) {
	if (onControl.value && !item.static) {
		item.select = !item.select;
	}
}



const itemsRef = shallowRef<HTMLElement[]>(null);

function calcPos() {
	itemsRef.value?.forEach(el => {
		const dataset = el.dataset;
		if (dataset.static === 'true') return;
		const id = dataset.id;
		const item = layout.value.find(item => String(item.i) === id);
		item.position = el.getBoundingClientRect();
	})
}

function inRow(items = selected.value) {
	return items.reduce((pre, cur, index, array) => {
		if (index === 0) {
			return pre;
		} else {
			return pre && cur.position.top === array[index - 1].position.top
				&& cur.position.height === array[index - 1].position.height;
		}
	}, true)
};
function inCol(items = selected.value) {
	return items.reduce((pre, cur, index, array) => {
		if (index === 0) {
			return pre;
		} else {
			return pre && cur.position.left === array[index - 1].position.left
				&& cur.position.width === array[index - 1].position.width;
		}
	}, true);
};
function isNested(rowDirect: boolean, colDirect: boolean) {
	if (rowDirect) {
		return selected.value.reduce((pre, cur, index, array) => {
			if (index === 0) {
				return pre;
			} else {
				return pre && (cur.position.left - array[index - 1].position.right < 30);
			}
		}, true)
	}
	if (colDirect) {
		return selected.value.reduce((pre, cur, index, array) => {
			if (index === 0) {
				return pre;
			} else {
				return pre && (cur.position.top - array[index - 1].position.bottom < 30);
			}
		}, true)
	}
}

function merge() {
	calcPos();
	const isInRow = inRow();
	const isInCol = inCol();
	const nested = isNested(isInRow, isInCol);
	if (isInRow && nested) {
		const firstSelected = selected.value?.[0];
		firstSelected.w = selected.value?.reduce((pre, cur) => {
			return pre + cur.w
		}, 0);

		selected.value?.forEach((v, index) => {
			if (index === 0) return;
			const i = layout.value?.findIndex(i => i === v);
			if (i > -1) {
				console.log('find i', i);
				layout.value?.splice(i, 1);
			}
		});
	}
	if (isInCol && nested) {
		const firstSelected = selected.value?.[0];
		firstSelected.h = selected.value?.reduce((pre, cur) => {
			return pre + cur.h
		}, 0);

		selected.value?.forEach((v, index) => {
			if (index === 0) return;
			const i = layout.value?.findIndex(i => i === v);
			if (i > -1) {
				console.log('find i', i);
				layout.value?.splice(i, 1);
			}
		});
	}
}

function split() {
	const canSplit = selected.value?.length === 1;
	const splitItem = { ...selected.value?.[0] };
	if (canSplit) {
		const isRowSplit = splitItem.w > 1;
		if (isRowSplit) {
			const splitItemIndex = splitItem.i;
			Array(splitItem.w)
				.fill(0)
				.forEach((_, index) => {
					console.log('forEach', index);
					layout.value?.splice(splitItemIndex + index, index === 0 ? 1 : 0, {
						...splitItem,
						w: 1,
						i: splitItem.i + index
					})
				})
		}
		const isColSplit = splitItem.h > 1;
		if (isColSplit) {
			const splitItemIndex = splitItem.i;
			const colLayout: number[] = colLayoutMap[splitItemIndex];
			const splitCandidate = colLayout.slice(0, splitItem.h);
			splitCandidate.forEach(i => {
				layout.value?.splice(i, i === splitItemIndex ? 1 : 0, {
					...splitItem,
					h: 1,
					i: i
				})
			})
		}
	}
	layout.value?.forEach(item => {
		item.select = false;
	})
}

defineExpose({
	merge,
	split
})

</script>

<style scoped>
.grid-container{
	display: grid;
	grid-template-columns: repeat(4,1fr);
	grid-template-rows: repeat(4,1fr);
	gap: 8px;
	grid-auto-flow: row dense;
}

div[data-select="true"]{
	outline-color: red;
	outline-style: solid;
	outline-width: 2px;
}

.grid-item{
	transition: all 0.3s;
}

</style>
