<template>
    <object class="swf" type="application/x-shockwave-flash" :data="url">
        <embed :src="url" />
    </object>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import professor from '@/assets/swf/professor.swf';

export default defineComponent({
name: "AnimatedNPC",
data(){
    return {
        url: '' as string
    }
},
mounted(): void {
    this.url = professor;
},
});
</script>

<style lang="scss" scoped>
.swf {
float: right;
position: relative;
width: 100px;
height: 100px;
margin-right: 10px;
margin-top: -1px;
font-size: 0pt;
line-height: 0pt;
border: 1px solid #ffe044;
background-color: #9a4029;
padding: 1px;
}
</style>