<template>
    <section class="component-layout ui-picker-date-layout rel">
        <div class="date-input-layout">
            <input class="date-input w100 h100 pdl5 pr5 bg-white" contenteditable="false" :placeholder="placeholder"
                   v-model="mergeDate" v-on:focus="isShowDatePickLayout=true" v-on:blur="isShowDatePickLayout=false"/>
            <img class="abs rt0" v-if="mergeDate" :src="icons.clear" @click="clearDate"/>
            <img class="abs rt0" v-else :src="icons.calendar" @click="focusInput"/>
        </div>
        <div class="date-pick-layout bg-white shadow abs over-hidden"
             :style="{left:pickerLeft+'px',minWidth:pickerMinWidth+'px'}"
             v-on:mousedown="focusInput"
             v-show="isShowDatePickLayout">
            <table>
                <tr>
                    <th class="year-item pdl10 pdr10 rel" v-if="leftMonthDateInfo.date">
                        <div class="abs lt0 w100 h100">{{format(leftMonthDateInfo.date[4],'yyyy - mm')}}</div>
                        <img class="year-select-btn last-year-btn left" :src="icons.left" @click="lastMonth"
                             v-if="isDoubleMode&&canShowLastMonth(currentLeftMonth)"/>
                        <img class="year-select-btn last-year-btn left" :src="icons.left" @click="lastMonth"
                             v-if="isSingleMode&&canShowLastMonth(currentLeftMonth)"/>
                        <img class="year-select-btn last-year-btn right" :src="icons.right" @click="nextMonth"
                             v-if="isSingleMode"/>
                    </th>
                    <th class="pdl10 pdr10" v-if="isDoubleMode"></th>
                    <th class="year-item pdl10 pdr10 rel" v-if="isDoubleMode&&rightMonthDateInfo.date">
                        <div class="abs lt0 w100 h100">{{format(rightMonthDateInfo.date[4],'yyyy - mm')}}</div>
                        <img class="year-select-btn next-year-btn right" :src="icons.right" @click="nextMonth"/>
                    </th>
                </tr>
                <tr>
                    <td>
                        <table class="month-layout left-month pdl10 pdr10 pdb10">
                            <tr class="day-of-week-description">
                                <th class="date-item invalid-item" v-for="day in defaultDayOfWeek">{{day}}</th>
                            </tr>
                            <tr v-for="row in leftMonthDateInfo.mergeList">
                                <td class="date-item"
                                    :class="[day.invalid?'invalid-item':(day.preview?'preview-item':'active-item'),isDefaultStartDate(day),isStartDate(day),isEndDate(day),isMiddleDate(day)]"
                                    v-for="day in row" :date-index="day.index" :date-time="day.time"
                                    @click="select(day)">{{day.day}}
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td class="pdl10 pdr10" v-if="isDoubleMode"></td>
                    <td v-if="isDoubleMode">
                        <table class="month-layout right-month pdl10 pdr10 pdb10">
                            <tr class="day-of-week-description">
                                <th class="date-item invalid-item" v-for="day in defaultDayOfWeek">{{day}}</th>
                            </tr>
                            <tr v-for="row in rightMonthDateInfo.mergeList">
                                <td class="date-item"
                                    :class="[day.invalid?'preview-item':(day.preview?'preview-item':'active-item'),isDefaultStartDate(day),isStartDate(day),isEndDate(day),isMiddleDate(day)]"
                                    v-for="day in row" :date-index="day.index" :date-time="day.time"
                                    @click="select(day)">{{day.day}}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </section>
</template>

<script>
    const Component = require('./component');
    export default new Component();
</script>

<style lang="scss" scoped="true">
    /*根字体*/
    @media (min-width: 1025px) {
        html {
            font-size: 28px;
        }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
        html {
            font-size: 24px;
        }
    }

    @media (min-width: 376px) and (max-width: 768px) {
        html {
            font-size: 22px;
        }
    }

    @media (min-width: 321px) and (max-width: 375px) {
        html {
            font-size: 20px;
        }
    }

    @media (max-width: 320px) {
        html {
            font-size: 18px;
        }
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        position: relative;
    }

    ::-webkit-scrollbar {
        display: none;
    }

    .over-scroll {
        -webkit-overflow-scrolling: touch;
        overflow: auto;
    }

    .over-hidden {
        overflow: hidden;
    }

    html, body {
        width: 100%;
        overflow-x: hidden;
        background-color: #ededed;
    }

    input,
    button {
        outline: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        border: none;
    }

    input {
        -webkit-appearance: none;
    }

    textarea {
        resize: none;
    }

    input, select, textarea, button {
        height: auto;
    }

    input:focus, select:focus, textarea:focus {
        border-color: #999;
        -moz-box-shadow: none;
        -webkit-box-shadow: none;
        box-shadow: none;
        text-shadow: none;
        outline: none;
    }

    input::-webkit-outer-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    section {
        display: block;
    }

    ol, ul {
        list-style: none;
    }

    img {
        border: 0;
    }

    a {
        text-decoration: none;
        color: #4b4b57;
        padding: 0;
        margin: 0;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }

    a:focus, a:active {
        outline: none;
        text-decoration: none;
        color: #4b4b57;
        border: none;
    }

    /**禁用文本选择*/
    li, ul, a, button, p, i {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    /**阴影*/
    .shadow {
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
        -webkit-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
    }

    .shadow-top {
        box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.25);
        -webkit-box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.25);
    }

    .shadow-bottom {
        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.25);
        -webkit-box-shadow: 0 1px 5px rgba(0, 0, 0, 0.25);
    }

    /**限制单行文本*/
    .one-line {
        word-break: keep-all;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /**Android 样式*/

    .clickable {
        background-color: white;
        transition: all 0.3s ease-out;
    }

    .clickable:active {
        background-color: gainsboro;
        transition: all 0.3s ease-out;
    }

    /**尺寸*/

    .h100 {
        height: 100%;
    }

    .w100 {
        width: 100%;
    }

    /**位置*/
    .left {
        float: left;
    }

    .right {
        float: right;
    }

    .abs {
        position: absolute;
    }

    .rel {
        position: relative;
    }

    .fix {
        position: fixed;
    }

    .lt0 {
        left: 0;
        top: 0;
    }

    .lb0 {
        left: 0;
        bottom: 0;
    }

    .rt0 {
        right: 0;
        top: 0;
    }

    .rb0 {
        right: 0;
        bottom: 0;
    }

    /**px转rem*/
    $fontbase: 32px;
    @function rem($px) {
        @return $px / $fontbase * 1rem;
    }

    /**字体大小*/
    $fontSizeNano: rem(18px);
    $fontSizeMini: rem(19px);
    $fontSizeSmall: rem(20px);
    $fontSizeNormal: rem(22px);
    $fontSizeMiddle: rem(24px);
    $fontSizeLarge: rem(26px);
    .fs-nano {
        font-size: $fontSizeNano;
    }

    .fs-mini {
        font-size: $fontSizeMini;
    }

    .fs-small {
        font-size: $fontSizeSmall;
    }

    .fs-normal {
        font-size: $fontSizeNormal;
    }

    .fs-middle {
        font-size: $fontSizeMiddle;
    }

    .fs-large {
        font-size: $fontSizeLarge;
    }

    /**颜色*/
    $red: #F04055;
    $black: #222222;
    $blackLight: #4b4b57;
    $gray: #989898;
    $default: #ededed;
    $white: #FFFFFF;
    $orange: #EE8A1F;
    $blue: #00AAEE;
    $zjyx: #06a0f3;

    * {
        font-size: $fontSizeNormal;
    }

    body {
        color: $blackLight;
    }

    /**尺寸*/
    $s5: rem(5px);
    $s10: rem(10px);
    $s15: rem(15px);
    $s20: rem(20px);
    $s30: rem(30px);
    $s40: rem(40px);
    $s50: rem(50px);
    $s60: rem(60px);
    $s70: rem(70px);
    $s80: rem(80px);
    $s90: rem(90px);
    $s100: rem(100px);
    $s110: rem(110px);
    $s120: rem(120px);

    /*padding*/

    .pd5 {
        padding: $s5;
    }

    .pdt5 {
        padding-top: $s5;
    }

    .pdb5 {
        padding-bottom: $s5;
    }

    .pdl5 {
        padding-left: $s5;
    }

    .pdr5 {
        padding-right: $s5;
    }

    .pd10 {
        padding: $s10;
    }

    .pdt10 {
        padding-top: $s10;
    }

    .pdb10 {
        padding-bottom: $s10;
    }

    .pdl10 {
        padding-left: $s10;
    }

    .pdr10 {
        padding-right: $s10;
    }

    .pd15 {
        padding: $s15;
    }

    .pdt15 {
        padding-top: $s15;
    }

    .pdb15 {
        padding-bottom: $s15;
    }

    .pdl15 {
        padding-left: $s15;
    }

    .pdr15 {
        padding-right: $s15;
    }

    .pd20 {
        padding: $s20;
    }

    .pdt20 {
        padding-top: $s20;
    }

    .pdb20 {
        padding-bottom: $s20;
    }

    .pdl20 {
        padding-left: $s20;
    }

    .pdr20 {
        padding-right: $s20;
    }

    /*margin*/

    .mg5 {
        margin: $s5;
    }

    .mgt5 {
        margin-top: $s5;
    }

    .mgb5 {
        margin-bottom: $s5;
    }

    .mgl5 {
        margin-left: $s5;
    }

    .mgr5 {
        margin-right: $s5;
    }

    .mg10 {
        margin: $s10;
    }

    .mgt10 {
        margin-top: $s10;
    }

    .mgb10 {
        margin-bottom: $s10;
    }

    .mgl10 {
        margin-left: $s10;
    }

    .mgr10 {
        margin-right: $s10;
    }

    .mg15 {
        margin: $s15;
    }

    .mgt15 {
        margin-top: $s15;
    }

    .mgb15 {
        margin-bottom: $s15;
    }

    .mgl15 {
        margin-left: $s15;
    }

    .mgr15 {
        margin-right: $s15;
    }

    .mg20 {
        margin: $s20;
    }

    .mgt20 {
        margin-top: $s20;
    }

    .mgb20 {
        margin-bottom: $s20;
    }

    .mgl20 {
        margin-left: $s20;
    }

    .mgr20 {
        margin-right: $s20;
    }

    $borderStyle: 1px solid #eee;

    .ui-picker-date-layout {
        * {
            z-index: unset;
        }
        .date-input-layout {
            width: 200px;
            height: 30px;
            cursor: pointer;
            input {
                line-height: 30px;
                font-size: 12px;
                border-radius: 3px;
                border: 1px solid #bbbec4;
            }
            img {
                width: 16px;
                height: 16px;
                margin: 7px $s5;
            }
        }
        .date-pick-layout {
            border-radius: 3px;
            .year-item {
                height: 32px;
                line-height: 32px;
                div {
                    font-size: 14px;
                    text-align: center;
                    z-index: 1;
                }
                .year-select-btn {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    z-index: 2;
                }
            }
            .invalid-item, .preview-item {
                color: #bbbec4;
            }
            .date-item {
                font-size: 12px;
                width: 24px;
                height: 24px;
                text-align: center;
                cursor: pointer;
                border-radius: rem(5px);
            }
            .invalid-item {
                cursor: not-allowed;
            }
            .active-item:hover,
            .preview-item:hover {
                background-color: #FFEEBC;
            }
            .default-start-date-item {
                border: 1px dashed;
            }
            .start-date-item,
            .end-date-item {
                background-color: #F9CC9D;
            }
            .middle-date-item {
                background-color: #C4DFB8;
            }
        }
    }

</style>
