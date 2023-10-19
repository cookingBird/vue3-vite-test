<template>
<div class="w-full h-full border border-red-500 grid-container p-2 relative">
	<div class="absolute -top-10 space-x-2">
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
		ref="itemsRef"
		v-for="item, index in items"
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
		{{ item.i }}
	</div>
</div>
</template>

<script setup lang="ts">
import { ref, watchEffect, shallowRef, computed } from 'vue';
import { useKeyModifier } from '@vueuse/core'
const items = ref([
	{ i: 1, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 2, w: 2, h: 3, static: true, select: false, position: null },
	{ i: 3, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 4, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 5, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 6, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 7, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 8, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 9, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 10, w: 1, h: 1, static: false, select: false, position: null },
	{ i: 11, w: 1, h: 1, static: false, select: false, position: null },
]);

const selected = computed(() => items.value.filter(item => item.select));

const isControled = useKeyModifier('Control');

function selectItem(item: any) {
	if (isControled.value && !item.static) {
		item.select = !item.select;
	}
}
const itemsRef = shallowRef<HTMLElement[]>(null);

const btns = [
	{ label: '合并', onClick: () => { console.log('合并'); handlerMerge(); } },
	{ label: '拆分', onClick: () => { console.log('拆分') } },
	{ label: '删除', onClick: () => { console.log('删除') } },
]

function calcPos() {
	itemsRef.value?.forEach(el => {
		const dataset = el.dataset;
		if (dataset.static === 'true') return;
		const id = dataset.id;
		const item = items.value.find(item => String(item.i) === id);
		item.position = el.getBoundingClientRect();
	})
}

function inRow(items = selected.value) {
	return items.reduce((pre, cur, index, array) => {
		if (index === 0) {
			return pre;
		} else {
			return pre && cur.position.top === array[index - 1].position.top;
		}
	}, true)
};
function inCol(items = selected.value) {
	return items.reduce((pre, cur, index, array) => {
		if (index === 0) {
			return pre;
		} else {
			return pre && cur.position.left === array[index - 1].position.left;
		}
	}, true);
};
function isNested(items = selected.value) {
	const rowDirect = inRow(items);
	if (rowDirect) {
		return selected.value.reduce((pre, cur, index, array) => {
			if (index === 0) {
				return pre;
			} else {
				return pre && (cur.position.left - array[index - 1].position.right < 30);
			}
		}, true)
	}
	const colDirect = inCol(items);
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

function handlerMerge() {
	calcPos();
	console.log('handlerMerge', items.value);
	console.log('isNested', isNested());
}
watchEffect(() => {
	console.log("itemsRef", itemsRef.value, itemsRef.value?.map((item) => item.dataset));
	console.log("itemsRef not static", itemsRef.value?.filter((item) => item.dataset.static === 'false'));
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
