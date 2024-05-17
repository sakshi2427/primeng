import {
    animate,
    AnimationEvent,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

const animationEvent = AnimationEvent;
const animationState = state;
const animationStyle = style;
const animationTransition = transition;
const animationTrigger = trigger;

export {
    animate,
    animationEvent,
    animationState,
    animationStyle,
    animationTransition,
    animationTrigger
};


import { CommonModule, DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    NgModule,
    NgZone,
    numberAttribute,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayService, PrimeNGConfig, PrimeTemplate, SharedModule, TranslationKeys } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConnectedOverlayScrollHandler, DomHandler } from 'primeng/dom';
import { RippleModule } from 'primeng/ripple';
import { ObjectUtils, UniqueComponentId, ZIndexUtils } from 'primeng/utils';
import { Subscription } from 'rxjs';
import { ChevronLeftIcon } from 'primeng/icons/chevronleft';
import { ChevronRightIcon } from 'primeng/icons/chevronright';
import { ChevronUpIcon } from 'primeng/icons/chevronup';
import { ChevronDownIcon } from 'primeng/icons/chevrondown';
import { TimesIcon } from 'primeng/icons/times';
import { CalendarIcon } from 'primeng/icons/calendar';
import { Nullable, VoidListener } from 'primeng/ts-helpers';
import { NavigationState, CalendarResponsiveOptions, CalendarTypeView, LocaleSettings, Month, CalendarMonthChangeEvent, CalendarYearChangeEvent } from './calendar.interface';

export const CALENDAR_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Calendar),
    multi: true
};
/**
 * Calendar also known as DatePicker, is a form component to work with dates.
 * @group Components
 */
@Component({
    selector: 'p-calendar',
    template: `
        <span
            #container
            [ngClass]="{
                'p-calendar': true,
                'p-input-icon-right': showIcon && iconDisplay === 'input',
                'p-calendar-w-btn': showIcon && iconDisplay === 'button',
                'p-calendar-timeonly': timeOnly,
                'p-calendar-disabled': disabled,
                'p-focus': focus || overlayVisible
            }"
            [ngStyle]="style"
            [class]="styleClass"
        >
            <ng-template [ngIf]="!inline">
                <input
                    #inputfield
                    type="text"
                    role="combobox"
                    [attr.id]="inputId"
                    [attr.name]="name"
                    [attr.required]="required"
                    [attr.aria-required]="required"
                    aria-autocomplete="none"
                    aria-haspopup="dialog"
                    [attr.aria-expanded]="overlayVisible ?? false"
                    [attr.aria-controls]="overlayVisible ? panelId : null"
                    [attr.aria-labelledby]="ariaLabelledBy"
                    [attr.aria-label]="ariaLabel"
                    [value]="inputFieldValue"
                    (focus)="onInputFocus($event)"
                    (keydown)="onInputKeydown($event)"
                    (click)="onInputClick()"
                    (blur)="onInputBlur($event)"
                    [readonly]="readonlyInput"
                    (input)="onUserInput($event)"
                    [ngStyle]="inputStyle"
                    [class]="inputStyleClass"
                    [placeholder]="placeholder || ''"
                    [disabled]="disabled"
                    [attr.tabindex]="tabindex"
                    [attr.inputmode]="touchUI ? 'off' : null"
                    [ngClass]="'p-inputtext p-component'"
                    autocomplete="off"
                />
                <ng-container *ngIf="showClear && !disabled && value != null">
                    <TimesIcon *ngIf="!clearIconTemplate" [styleClass]="'p-calendar-clear-icon'" (click)="clear()" />
                    <span *ngIf="clearIconTemplate" class="p-calendar-clear-icon" (click)="clear()">
                        <ng-template *ngTemplateOutlet="clearIconTemplate"></ng-template>
                    </span>
                </ng-container>
                <button
                    type="button"
                    [attr.aria-label]="iconButtonAriaLabel"
                    aria-haspopup="dialog"
                    [attr.aria-expanded]="overlayVisible ?? false"
                    [attr.aria-controls]="overlayVisible ? panelId : null"
                    pButton
                    pRipple
                    *ngIf="showIcon && iconDisplay === 'button'"
                    (click)="onButtonClick($event, inputfield)"
                    class="p-datepicker-trigger p-button-icon-only"
                    [disabled]="disabled"
                    tabindex="0"
                >
                    <span *ngIf="icon" [ngClass]="icon"></span>
                    <ng-container *ngIf="!icon">
                        <CalendarIcon *ngIf="!triggerIconTemplate" />
                        <ng-template *ngTemplateOutlet="triggerIconTemplate"></ng-template>
                    </ng-container>
                </button>
                <ng-container *ngIf="iconDisplay === 'input' && showIcon">
                    <CalendarIcon
                        (click)="onButtonClick($event)"
                        *ngIf="!inputIconTemplate"
                        [ngClass]="{
                            'p-datepicker-icon': showOnFocus
                        }"
                    />
                    <ng-container *ngTemplateOutlet="inputIconTemplate; context: { clickCallBack: onButtonClick.bind(this) }"></ng-container>
                </ng-container>
            </ng-template>
            <div
                #contentWrapper
                [attr.id]="panelId"
                [class]="panelStyleClass"
                [ngStyle]="panelStyle"
                [ngClass]="{
                    'p-datepicker p-component': true,
                    'p-datepicker-inline': inline,
                    'p-disabled': disabled,
                    'p-datepicker-timeonly': timeOnly,
                    'p-datepicker-multiple-month': this.numberOfMonths > 1,
                    'p-datepicker-monthpicker': view === 'month',
                    'p-datepicker-touch-ui': touchUI
                }"
                [@overlayAnimation]="
                    touchUI
                        ? { value: 'visibleTouchUI', params: { showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions } }
                        : { value: 'visible', params: { showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions } }
                "
                [attr.aria-label]="getTranslation('chooseDate')"
                [attr.role]="inline ? null : 'dialog'"
                [attr.aria-modal]="inline ? null : 'true'"
                [@.disabled]="inline === true"
                (@overlayAnimation.start)="onOverlayAnimationStart($event)"
                (@overlayAnimation.done)="onOverlayAnimationDone($event)"
                (click)="onOverlayClick($event)"
                *ngIf="inline || overlayVisible"
            >
                <ng-content select="p-header"></ng-content>
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
                <ng-container *ngIf="!timeOnly">
                    <div class="p-datepicker-group-container">
                        <div class="p-datepicker-group" *ngFor="let month of months; let i = index">
                            <div class="p-datepicker-header">
                                <button (keydown)="onContainerButtonKeydown($event)" class="p-datepicker-prev p-link" (click)="onPrevButtonClick($event)" *ngIf="i === 0" type="button" [attr.aria-label]="prevIconAriaLabel" pRipple>
                                    <ChevronLeftIcon [styleClass]="'p-datepicker-prev-icon'" *ngIf="!previousIconTemplate" />
                                    <span *ngIf="previousIconTemplate" class="p-datepicker-prev-icon">
                                        <ng-template *ngTemplateOutlet="previousIconTemplate"></ng-template>
                                    </span>
                                </button>
                                <div class="p-datepicker-title">
                                    <button
                                        type="button"
                                        (click)="switchToMonthView($event)"
                                        (keydown)="onContainerButtonKeydown($event)"
                                        *ngIf="currentView === 'date'"
                                        class="p-datepicker-month p-link"
                                        [disabled]="switchViewButtonDisabled()"
                                        [attr.aria-label]="this.getTranslation('chooseMonth')"
                                    >
                                        {{ getMonthName(month.month) }}
                                    </button>
                                    <button
                                        type="button"
                                        (click)="switchToYearView($event)"
                                        (keydown)="onContainerButtonKeydown($event)"
                                        *ngIf="currentView !== 'year'"
                                        class="p-datepicker-year p-link"
                                        [disabled]="switchViewButtonDisabled()"
                                        [attr.aria-label]="getTranslation('chooseYear')"
                                    >
                                        {{ getYear(month) }}
                                    </button>
                                    <span class="p-datepicker-decade" *ngIf="currentView === 'year'">
                                        <ng-container *ngIf="!decadeTemplate">{{ yearPickerValues()[0] }} - {{ yearPickerValues()[yearPickerValues().length - 1] }}</ng-container>
                                        <ng-container *ngTemplateOutlet="decadeTemplate; context: { $implicit: yearPickerValues }"></ng-container>
                                    </span>
                                </div>
                                <button
                                    (keydown)="onContainerButtonKeydown($event)"
                                    class="p-datepicker-next p-link"
                                    (click)="onNextButtonClick($event)"
                                    [style.display]="numberOfMonths === 1 ? 'inline-flex' : i === numberOfMonths - 1 ? 'inline-flex' : 'none'"
                                    type="button"
                                    [attr.aria-label]="nextIconAriaLabel"
                                    pRipple
                                >
                                    <ChevronRightIcon [styleClass]="'p-datepicker-next-icon'" *ngIf="!nextIconTemplate" />
                                    <span *ngIf="nextIconTemplate" class="p-datepicker-next-icon">
                                        <ng-template *ngTemplateOutlet="nextIconTemplate"></ng-template>
                                    </span>
                                </button>
                            </div>
                            <div class="p-datepicker-calendar-container" *ngIf="currentView === 'date'">
                                <table class="p-datepicker-calendar" role="grid">
                                    <thead>
                                        <tr>
                                            <th *ngIf="showWeek" class="p-datepicker-weekheader p-disabled">
                                                <span>{{ getTranslation('weekHeader') }}</span>
                                            </th>
                                            <th scope="col" *ngFor="let weekDay of weekDays; let begin = first; let end = last">
                                                <span>{{ weekDay }}</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr *ngFor="let week of month.dates; let j = index">
                                            <td *ngIf="showWeek" class="p-datepicker-weeknumber">
                                                <span class="p-disabled">
                                                    {{ month.weekNumbers[j] }}
                                                </span>
                                            </td>
                                            <td *ngFor="let date of week" [attr.aria-label]="date.day" [ngClass]="{ 'p-datepicker-other-month': date.otherMonth, 'p-datepicker-today': date.today }">
                                                <ng-container *ngIf="date.otherMonth ? showOtherMonths : true">
                                                    <span
                                                        [ngClass]="{ 'p-highlight': isSelected(date) && date.selectable, 'p-disabled': !date.selectable }"
                                                        (click)="onDateSelect($event, date)"
                                                        draggable="false"
                                                        (keydown)="onDateCellKeydown($event, date, i)"
                                                        pRipple
                                                    >
                                                        <ng-container *ngIf="!dateTemplate && (date.selectable || !disabledDateTemplate)">{{ date.day }}</ng-container>
                                                        <ng-container *ngIf="date.selectable || !disabledDateTemplate">
                                                            <ng-container *ngTemplateOutlet="dateTemplate; context: { $implicit: date }"></ng-container>
                                                        </ng-container>
                                                        <ng-container *ngIf="!date.selectable">
                                                            <ng-container *ngTemplateOutlet="disabledDateTemplate; context: { $implicit: date }"></ng-container>
                                                        </ng-container>
                                                    </span>
                                                    <div *ngIf="isSelected(date)" class="p-hidden-accessible" aria-live="polite">
                                                        {{ date.day }}
                                                    </div>
                                                </ng-container>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="p-monthpicker" *ngIf="currentView === 'month'">
                        <span
                            *ngFor="let m of monthPickerValues(); let i = index"
                            (click)="onMonthSelect($event, i)"
                            (keydown)="onMonthCellKeydown($event, i)"
                            class="p-monthpicker-month"
                            [ngClass]="{ 'p-highlight': isMonthSelected(i), 'p-disabled': isMonthDisabled(i) }"
                            pRipple
                        >
                            {{ m }}
                            <div *ngIf="isMonthSelected(i)" class="p-hidden-accessible" aria-live="polite">
                                {{ m }}
                            </div>
                        </span>
                    </div>
                    <div class="p-yearpicker" *ngIf="currentView === 'year'">
                        <span
                            *ngFor="let y of yearPickerValues()"
                            (click)="onYearSelect($event, y)"
                            (keydown)="onYearCellKeydown($event, y)"
                            class="p-yearpicker-year"
                            [ngClass]="{ 'p-highlight': isYearSelected(y), 'p-disabled': isYearDisabled(y) }"
                            pRipple
                        >
                            {{ y }}
                            <div *ngIf="isYearSelected(y)" class="p-hidden-accessible" aria-live="polite">
                                {{ y }}
                            </div>
                        </span>
                    </div>
                </ng-container>
                <div class="p-timepicker" *ngIf="(showTime || timeOnly) && currentView === 'date'">
                    <div class="p-hour-picker">
                        <button
                            class="p-link"
                            type="button"
                            (keydown)="onContainerButtonKeydown($event)"
                            (keydown.enter)="incrementHour($event)"
                            (keydown.space)="incrementHour($event)"
                            (mousedown)="onTimePickerElementMouseDown($event, 0, 1)"
                            (mouseup)="onTimePickerElementMouseUp($event)"
                            (keyup.enter)="onTimePickerElementMouseUp($event)"
                            (keyup.space)="onTimePickerElementMouseUp($event)"
                            (mouseleave)="onTimePickerElementMouseLeave()"
                            [attr.aria-label]="getTranslation('nextHour')"
                            pRipple
                        >
                            <ChevronUpIcon *ngIf="!incrementIconTemplate" />
                            <ng-template *ngTemplateOutlet="incrementIconTemplate"></ng-template>
                        </button>
                        <span><ng-container *ngIf="currentHour < 10">0</ng-container>{{ currentHour }}</span>
                        <button
                            class="p-link"
                            type="button"
                            (keydown)="onContainerButtonKeydown($event)"
                            (keydown.enter)="decrementHour($event)"
                            (keydown.space)="decrementHour($event)"
                            (mousedown)="onTimePickerElementMouseDown($event, 0, -1)"
                            (mouseup)="onTimePickerElementMouseUp($event)"
                            (keyup.enter)="onTimePickerElementMouseUp($event)"
                            (keyup.space)="onTimePickerElementMouseUp($event)"
                            (mouseleave)="onTimePickerElementMouseLeave()"
                            [attr.aria-label]="getTranslation('prevHour')"
                            pRipple
                        >
                            <ChevronDownIcon *ngIf="!decrementIconTemplate" />
                            <ng-template *ngTemplateOutlet="decrementIconTemplate"></ng-template>
                        </button>
                    </div>
                    <div class="p-separator">
                        <span>{{ timeSeparator }}</span>
                    </div>
                    <div class="p-minute-picker">
                        <button
                            class="p-link"
                            type="button"
                            (keydown)="onContainerButtonKeydown($event)"
                            (keydown.enter)="incrementMinute($event)"
                            (keydown.space)="incrementMinute($event)"
                            (mousedown)="onTimePickerElementMouseDown($event, 1, 1)"
                            (mouseup)="onTimePickerElementMouseUp($event)"
                            (keyup.enter)="onTimePickerElementMouseUp($event)"
                            (keyup.space)="onTimePickerElementMouseUp($event)"
                            (mouseleave)="onTimePickerElementMouseLeave()"
                            [attr.aria-label]="getTranslation('nextMinute')"
                            pRipple
                        >
                            <ChevronUpIcon *ngIf="!incrementIconTemplate" />
                            <ng-template *ngTemplateOutlet="incrementIconTemplate"></ng-template>
                        </button>
                        <span><ng-container *ngIf="currentMinute < 10">0</ng-container>{{ currentMinute }}</span>
                        <button
                            class="p-link"
                            type="button"
                            (keydown)="onContainerButtonKeydown($event)"
                            (keydown.enter)="decrementMinute($event)"
                            (keydown.space)="decrementMinute($event)"
                            (mousedown)="onTimePickerElementMouseDown($event, 1, -1)"
                            (mouseup)="onTimePickerElementMouseUp($event)"
                            (keyup.enter)="onTimePickerElementMouseUp($event)"
                            (keyup.space)="onTimePickerElementMouseUp($event)"
                            (mouseleave)="onTimePickerElementMouseLeave()"
                            [attr.aria-label]="getTranslation('prevMinute')"
                            pRipple
                        >
                            <ChevronDownIcon *ngIf="!decrementIconTemplate" />
                            <ng-template *ngTemplateOutlet="decrementIconTemplate"></ng-template>
                        </button>
                    </div>
                    <div class="p-separator" *ngIf="showSeconds">
                        <span>{{ timeSeparator }}</span>
                    </div>
                    <div class="p-second-picker" *ngIf="showSeconds">
                        <button
                            class="p-link"
                            type="button"
                            (keydown)="onContainerButtonKeydown($event)"
                            (keydown.enter)="incrementSecond($event)"
                            (keydown.space)="incrementSecond($event)"
                            (mousedown)="onTimePickerElementMouseDown($event, 2, 1)"
                            (mouseup)="onTimePickerElementMouseUp($event)"
                            (keyup.enter)="onTimePickerElementMouseUp($event)"
                            (keyup.space)="onTimePickerElementMouseUp($event)"
                            (mouseleave)="onTimePickerElementMouseLeave()"
                            [attr.aria-label]="getTranslation('nextSecond')"
                            pRipple
                        >
                            <ChevronUpIcon *ngIf="!incrementIconTemplate" />
                            <ng-template *ngTemplateOutlet="incrementIconTemplate"></ng-template>
                        </button>
                        <span><ng-container *ngIf="currentSecond < 10">0</ng-container>{{ currentSecond }}</span>
                        <button
                            class="p-link"
                            type="button"
                            (keydown)="onContainerButtonKeydown($event)"
                            (keydown.enter)="decrementSecond($event)"
                            (keydown.space)="decrementSecond($event)"
                            (mousedown)="onTimePickerElementMouseDown($event, 2, -1)"
                            (mouseup)="onTimePickerElementMouseUp($event)"
                            (keyup.enter)="onTimePickerElementMouseUp($event)"
                            (keyup.space)="onTimePickerElementMouseUp($event)"
                            (mouseleave)="onTimePickerElementMouseLeave()"
                            [attr.aria-label]="getTranslation('prevSecond')"
                            pRipple
                        >
                            <ChevronDownIcon *ngIf="!decrementIconTemplate" />
                            <ng-template *ngTemplateOutlet="decrementIconTemplate"></ng-template>
                        </button>
                    </div>
                    <div class="p-ampm-picker" *ngIf="hourFormat == '12'">
                        <button class="p-link" type="button" (keydown)="onContainerButtonKeydown($event)" (click)="toggleAMPM($event)" (keydown.enter)="toggleAMPM($event)" [attr.aria-label]="getTranslation('am')" pRipple>
                            <ChevronUpIcon *ngIf="!incrementIconTemplate" />
                            <ng-template *ngTemplateOutlet="incrementIconTemplate"></ng-template>
                        </button>
                        <span>{{ pm ? 'PM' : 'AM' }}</span>
                        <button class="p-link" type="button" (keydown)="onContainerButtonKeydown($event)" (click)="toggleAMPM($event)" (keydown.enter)="toggleAMPM($event)" [attr.aria-label]="getTranslation('pm')" pRipple>
                            <ChevronDownIcon *ngIf="!decrementIconTemplate" />
                            <ng-template *ngTemplateOutlet="decrementIconTemplate"></ng-template>
                        </button>
                    </div>
                </div>
                <div class="p-datepicker-buttonbar" *ngIf="showButtonBar">
                    <button type="button" [label]="getTranslation('today')" (keydown)="onContainerButtonKeydown($event)" (click)="onTodayButtonClick($event)" pButton pRipple [ngClass]="[todayButtonStyleClass]"></button>
                    <button type="button" [label]="getTranslation('clear')" (keydown)="onContainerButtonKeydown($event)" (click)="onClearButtonClick($event)" pButton pRipple [ngClass]="[clearButtonStyleClass]"></button>
                </div>
                <ng-content select="p-footer"></ng-content>
                <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
            </div>
        </span>
    `,
    animations: [
        trigger('overlayAnimation', [
            state(
                'visibleTouchUI',
                style({
                    transform: 'translate(-50%,-50%)',
                    opacity: 1
                })
            ),
            transition('void => visible', [style({ opacity: 0, transform: 'scaleY(0.8)' }), animate('{{showTransitionParams}}', style({ opacity: 1, transform: '*' }))]),
            transition('visible => void', [animate('{{hideTransitionParams}}', style({ opacity: 0 }))]),
            transition('void => visibleTouchUI', [style({ opacity: 0, transform: 'translate3d(-50%, -40%, 0) scale(0.9)' }), animate('{{showTransitionParams}}')]),
            transition('visibleTouchUI => void', [
                animate(
                    '{{hideTransitionParams}}',
                    style({
                        opacity: 0,
                        transform: 'translate3d(-50%, -40%, 0) scale(0.9)'
                    })
                )
            ])
        ])
    ],
    host: {
        class: 'p-element p-inputwrapper',
        '[class.p-inputwrapper-filled]': 'filled',
        '[class.p-inputwrapper-focus]': 'focus',
        '[class.p-calendar-clearable]': 'showClear && !disabled'
    },
    providers: [CALENDAR_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() iconDisplay: 'input' | 'button' = 'button';
    /**
     * Inline style of the component.
     * @group Props
     */
    @Input() style: { [klass: string]: any } | null | undefined;
    /**
     * Style class of the component.
     * @group Props
     */
    @Input() styleClass: string | undefined;
    /**
     * Inline style of the input field.
     * @group Props
     */
    @Input() inputStyle: { [klass: string]: any } | null | undefined;
    /**
     * Identifier of the focus input to match a label defined for the component.
     * @group Props
     */
    @Input() inputId: string | undefined;
    /**
     * Name of the input element.
     * @group Props
     */
    @Input() name: string | undefined;
    /**
     * Style class of the input field.
     * @group Props
     */
    @Input() inputStyleClass: string | undefined;
    /**
     * Placeholder text for the input.
     * @group Props
     */
    @Input() placeholder: string | undefined;
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    @Input() ariaLabelledBy: string | undefined;
    /**
     * Defines a string that labels the input for accessibility.
     * @group Props
     */
    @Input() ariaLabel: string | undefined;

    /**
     * Defines a string that labels the icon button for accessibility.
     * @group Props
     */
    @Input() iconAriaLabel: string | undefined;
    /**
     * When specified, disables the component.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) disabled: boolean | undefined;
    /**
     * Format of the date which can also be defined at locale settings.
     * @group Props
     */
    @Input() dateFormat: string | undefined;
    /**
     * Separator for multiple selection mode.
     * @group Props
     */
    @Input() multipleSeparator: string = ',';
    /**
     * Separator for joining start and end dates on range selection mode.
     * @group Props
     */
    @Input() rangeSeparator: string = '-';
    /**
     * When enabled, displays the calendar as inline. Default is false for popup mode.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) inline: boolean = false;
    /**
     * Whether to display dates in other months (non-selectable) at the start or end of the current month. To make these days selectable use the selectOtherMonths option.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) showOtherMonths: boolean = true;
    /**
     * Whether days in other months shown before or after the current month are selectable. This only applies if the showOtherMonths option is set to true.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) selectOtherMonths: boolean | undefined;
    /**
     * When enabled, displays a button with icon next to input.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) showIcon: boolean | undefined;
    /**
     * Icon of the calendar button.
     * @group Props
     */
    @Input() icon: string | undefined;
    /**
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having#mydiv as variable name).
     * @group Props
     */
    @Input() appendTo: HTMLElement | ElementRef | TemplateRef<any> | string | null | undefined | any;
    /**
     * When specified, prevents entering the date manually with keyboard.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) readonlyInput: boolean | undefined;
    /**
     * The cutoff year for determining the century for a date.
     * @group Props
     */
    @Input() shortYearCutoff: any = '+10';
    /**
     * Whether the month should be rendered as a dropdown instead of text.
     * @group Props
     * @deprecated Navigator is always on.
     */
    @Input({ transform: booleanAttribute }) monthNavigator: boolean | undefined;
    /**
     * Whether the year should be rendered as a dropdown instead of text.
     * @group Props
     * @deprecated  Navigator is always on.
     */
    @Input({ transform: booleanAttribute }) yearNavigator: boolean | undefined;
    /**
     * Specifies 12 or 24 hour format.
     * @group Props
     */
    @Input() hourFormat: string = '24';
    /**
     * Whether to display timepicker only.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) timeOnly: boolean | undefined;
    /**
     * Hours to change per step.
     * @group Props
     */
    @Input({ transform: numberAttribute }) stepHour: number = 1;
    /**
     * Minutes to change per step.
     * @group Props
     */
    @Input({ transform: numberAttribute }) stepMinute: number = 1;
    /**
     * Seconds to change per step.
     * @group Props
     */
    @Input({ transform: numberAttribute }) stepSecond: number = 1;
    /**
     * Whether to show the seconds in time picker.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) showSeconds: boolean = false;
    /**
     * When present, it specifies that an input field must be filled out before submitting the form.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) required: boolean | undefined;
    /**
     * When disabled, datepicker will not be visible with input focus.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) showOnFocus: boolean = true;
    /**
     * When enabled, calendar will show week numbers.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) showWeek: boolean = false;
    /**
     * When enabled, calendar will start week numbers from first day of the year.
     * @group Props
     */
    @Input() startWeekFromFirstDayOfYear: boolean = false;
    /**
     * When enabled, a clear icon is displayed to clear the value.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) showClear: boolean = false;
    /**
     * Type of the value to write back to ngModel, default is date and alternative is string.
     * @group Props
     */
    @Input() dataType: string = 'date';
    /**
     * Defines the quantity of the selection, valid values are "single", "multiple" and "range".
     * @group Props
     */
    @Input() selectionMode: 'single' | 'multiple' | 'range' | undefined = 'single';
    /**
     * Maximum number of selectable dates in multiple mode.
     * @group Props
     */
    @Input({ transform: numberAttribute }) maxDateCount: number | undefined;
    /**
     * Whether to display today and clear buttons at the footer
     * @group Props
     */
    @Input({ transform: booleanAttribute }) showButtonBar: boolean | undefined;
    /**
     * Style class of the today button.
     * @group Props
     */
    @Input() todayButtonStyleClass: string = 'p-button-text';
    /**
     * Style class of the clear button.
     * @group Props
     */
    @Input() clearButtonStyleClass: string = 'p-button-text';
    /**
     * Whether to automatically manage layering.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) autoZIndex: boolean = true;
    /**
     * Base zIndex value to use in layering.
     * @group Props
     */
    @Input({ transform: numberAttribute }) baseZIndex: number = 0;
    /**
     * Style class of the datetimepicker container element.
     * @group Props
     */
    @Input() panelStyleClass: string | undefined;
    /**
     * Inline style of the datetimepicker container element.
     * @group Props
     */
    @Input() panelStyle: any;
    /**
     * Keep invalid value when input blur.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) keepInvalid: boolean = false;
    /**
     * Whether to hide the overlay on date selection.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) hideOnDateTimeSelect: boolean = true;
    /**
     * When enabled, calendar overlay is displayed as optimized for touch devices.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) touchUI: boolean | undefined;
    /**
     * Separator of time selector.
     * @group Props
     */
    @Input() timeSeparator: string = ':';
    /**
     * When enabled, can only focus on elements inside the calendar.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) focusTrap: boolean = true;
    /**
     * Transition options of the show animation.
     * @group Props
     */
    @Input() showTransitionOptions: string = '.12s cubic-bezier(0, 0, 0.2, 1)';
    /**
     * Transition options of the hide animation.
     * @group Props
     */
    @Input() hideTransitionOptions: string = '.1s linear';
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    @Input({ transform: numberAttribute }) tabindex: number | undefined;
    /**
     * The minimum selectable date.
     * @group Props
     */
    @Input() get minDate(): Date | undefined | null {
        return this._minDate;
    }
        set minDate(date: Date | undefined | null) {
        this._minDate = date;
        
        if (this.currentMonth != null && this.currentYear) {
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }

    /**
     * The maximum selectable date.
     * @group Props
     */
    @Input() get maxDate(): Date | undefined | null {
        return this._maxDate;
    }
        set maxDate(date: Date | undefined | null) {
        this._maxDate = date;
        
        if (this.currentMonth != undefined) {
            if (this.currentMonth != null && this.currentYear) {
                this.createMonths(this.currentMonth, this.currentYear);
            }
        }
    }

    /**
     * Array with dates that should be disabled (not selectable).
     * @group Props
     */
    @Input() get disabledDates(): Date[] {
        return this._disabledDates;
    }
        set disabledDates(disabledDates: Date[]) {
        this._disabledDates = disabledDates;
        
        if (this.currentMonth && this.currentYear) {
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }

    /**
     * Array with weekday numbers that should be disabled (not selectable).
     * @group Props
     */
    @Input() get disabledDays(): number[] {
        return this._disabledDays;
    }
        set disabledDays(disabledDays: number[]) {
        this._disabledDays = disabledDays;
        
        if (this.currentMonth != undefined) {
            if (this.currentMonth != null) {
                if (this.currentYear) {
                    this.createMonths(this.currentMonth, this.currentYear);
                }
            }
        }
    }

    /**
     * The range of years displayed in the year drop-down in (nnnn:nnnn) format such as (2000:2020).
     * @group Props
     * @deprecated Years are based on decades by default.
     */
    @Input() get yearRange(): string {
        return this._yearRange;
    }
    set yearRange(yearRange: string) {
        this._yearRange = yearRange;

        if (yearRange) {
            const years = yearRange.split(':');
            const yearStart = parseInt(years[0]);
            const yearEnd = parseInt(years[1]);

            this.populateYearOptions(yearStart, yearEnd);
        }
    }
    /**
     * Whether to display timepicker.
     * @group Props
     */
    @Input() get showTime(): boolean {
        return this._showTime;
    }
    set showTime(showTime: boolean) {
        this._showTime = showTime;

        if (this.currentHour === undefined) {
            this.initTime(this.value || new Date());
        }
        this.updateInputfield();
    }
    /**
     * An array of options for responsive design.
     * @group Props
     */
    @Input() get responsiveOptions(): CalendarResponsiveOptions[] {
        return this._responsiveOptions;
    }
    set responsiveOptions(responsiveOptions: CalendarResponsiveOptions[]) {
        this._responsiveOptions = responsiveOptions;

        this.destroyResponsiveStyleElement();
        this.createResponsiveStyle();
    }
    /**
     * Number of months to display.
     * @group Props
     */
    @Input() get numberOfMonths(): number {
        return this._numberOfMonths;
    }
    set numberOfMonths(numberOfMonths: number) {
        this._numberOfMonths = numberOfMonths;

        this.destroyResponsiveStyleElement();
        this.createResponsiveStyle();
    }
    /**
     * Defines the first of the week for various date calculations.
     * @group Props
     */
    @Input() get firstDayOfWeek(): number {
        return this._firstDayOfWeek;
    }
    set firstDayOfWeek(firstDayOfWeek: number) {
        this._firstDayOfWeek = firstDayOfWeek;

        this.createWeekDays();
    }
    /**
     * Option to set calendar locale.
     * @group Props
     * @deprecated Locale property has no effect, use new i18n API instead.
     */
    @Input() set locale(newLocale: LocaleSettings) {
        console.warn('Locale property has no effect, use new i18n API instead.');
    }
    /**
     * Type of view to display, valid values are "date" for datepicker and "month" for month picker.
     * @group Props
     */
    @Input() get view(): CalendarTypeView {
        return this._view;
    }
    set view(view: CalendarTypeView) {
        this._view = view;
        this.currentView = this._view;
    }
    /**
     * Set the date to highlight on first opening if the field is blank.
     * @group Props
     */
    @Input() get defaultDate(): Date {
        return this._defaultDate;
    }
    set defaultDate(defaultDate: Date) {
        this._defaultDate = defaultDate;

        if (this.initialized) {
            const date = defaultDate || new Date();
            this.currentMonth = date.getMonth();
            this.currentYear = date.getFullYear();
            this.initTime(date);
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }
    /**
     * Callback to invoke on focus of input field.
     * @param {Event} event - browser event.
     * @group Emits
     */
    @Output() onFocus: EventEmitter<Event> = new EventEmitter<Event>();
    /**
     * Callback to invoke on blur of input field.
     * @param {Event} event - browser event.
     * @group Emits
     */
    @Output() onBlur: EventEmitter<Event> = new EventEmitter<Event>();
    /**
     * Callback to invoke when date panel closed.
     * @param {Event} event - Mouse event
     * @group Emits
     */
    @Output() onClose: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();
    /**
     * Callback to invoke on date select.
     * @param {Date} date - date value.
     * @group Emits
     */
    @Output() onSelect: EventEmitter<Date> = new EventEmitter<Date>();
    /**
     * Callback to invoke when input field cleared.
     * @group Emits
     */
    @Output() onClear: EventEmitter<any> = new EventEmitter<any>();
    /**
     * Callback to invoke when input field is being typed.
     * @param {Event} event - browser event
     * @group Emits
     */
    @Output() onInput: EventEmitter<any> = new EventEmitter<any>();
    /**
     * Callback to invoke when today button is clicked.
     * @param {Date} date - today as a date instance.
     * @group Emits
     */
    @Output() onTodayClick: EventEmitter<Date> = new EventEmitter<Date>();
    /**
     * Callback to invoke when clear button is clicked.
     * @param {Event} event - browser event.
     * @group Emits
     */
    @Output() onClearClick: EventEmitter<any> = new EventEmitter<any>();
    /**
     * Callback to invoke when a month is changed using the navigators.
     * @param {CalendarMonthChangeEvent} event - custom month change event.
     * @group Emits
     */
    @Output() onMonthChange: EventEmitter<CalendarMonthChangeEvent> = new EventEmitter<CalendarMonthChangeEvent>();
    /**
     * Callback to invoke when a year is changed using the navigators.
     * @param {CalendarYearChangeEvent} event - custom year change event.
     * @group Emits
     */
    @Output() onYearChange: EventEmitter<CalendarYearChangeEvent> = new EventEmitter<CalendarYearChangeEvent>();
    /**
     * Callback to invoke when clicked outside of the date panel.
     * @group Emits
     */
    @Output() onClickOutside: EventEmitter<any> = new EventEmitter<any>();
    /**
     * Callback to invoke when datepicker panel is shown.
     * @group Emits
     */
    @Output() onShow: EventEmitter<any> = new EventEmitter<any>();

    @ContentChildren(PrimeTemplate) templates!: QueryList<PrimeTemplate>;

    @ViewChild('container', { static: false }) containerViewChild: Nullable<ElementRef>;

    @ViewChild('inputfield', { static: false }) inputfieldViewChild: Nullable<ElementRef>;

@ViewChild('contentWrapper', { static: false })
set content(content: ElementRef) {
    this.contentViewChild = content;

    if (this.contentViewChild) {
        if (this.isMonthNavigate) {
            this.zone.runOutsideAngular(() => {
                setTimeout(() => {
                    this.zone.run(() => {
                        this.updateFocus();
                        this.isMonthNavigate = false;
                    });
                });
            });
        } else {
            if (!this.focus && !this.inline) {
                this.initFocusableCell();
            }
        }
    }
}

    contentViewChild!: ElementRef;

    value: any;

    dates: Nullable<Date[]>;

    months!: Month[];

    weekDays: Nullable<string[]>;

    currentMonth!: number;

    currentYear!: number;

    currentHour: Nullable<number>;

    currentMinute: Nullable<number>;

    currentSecond: Nullable<number>;

    pm: Nullable<boolean>;

    mask: Nullable<HTMLDivElement>;

    maskClickListener: VoidListener;

    overlay: Nullable<HTMLDivElement>;

    responsiveStyleElement: HTMLStyleElement | undefined | null;

    overlayVisible: Nullable<boolean>;

    onModelChange: Function = () => {};

    onModelTouched: Function = () => {};

    calendarElement: Nullable<HTMLElement | ElementRef>;

    timePickerTimer: any;

    documentClickListener: VoidListener;

    animationEndListener: VoidListener;

    ticksTo1970: Nullable<number>;

    yearOptions: Nullable<number[]>;

    focus: Nullable<boolean>;

    isKeydown: Nullable<boolean>;

    filled: Nullable<boolean>;

    inputFieldValue: Nullable<string> = null;

    _minDate?: Date | null;

    _maxDate?: Date | null;

    _showTime!: boolean;

    _yearRange!: string;

    preventDocumentListener: Nullable<boolean>;

    dateTemplate: Nullable<TemplateRef<any>>;

    headerTemplate: Nullable<TemplateRef<any>>;

    footerTemplate: Nullable<TemplateRef<any>>;

    disabledDateTemplate: Nullable<TemplateRef<any>>;

    decadeTemplate: Nullable<TemplateRef<any>>;

    previousIconTemplate: Nullable<TemplateRef<any>>;

    nextIconTemplate: Nullable<TemplateRef<any>>;

    triggerIconTemplate: Nullable<TemplateRef<any>>;

    clearIconTemplate: Nullable<TemplateRef<any>>;

    decrementIconTemplate: Nullable<TemplateRef<any>>;

    incrementIconTemplate: Nullable<TemplateRef<any>>;

    inputIconTemplate: Nullable<TemplateRef<any>>;

    _disabledDates!: Array<Date>;

    _disabledDays!: Array<number>;

    selectElement: Nullable;

    todayElement: Nullable;

    focusElement: Nullable;

    scrollHandler: Nullable<ConnectedOverlayScrollHandler>;

    documentResizeListener: VoidListener;

    navigationState: Nullable<NavigationState> = null;

    isMonthNavigate: Nullable<boolean>;

    initialized: Nullable<boolean>;

    translationSubscription: Nullable<Subscription>;

    _locale!: LocaleSettings;

    _responsiveOptions!: CalendarResponsiveOptions[];

    currentView: Nullable<string>;

    attributeSelector: Nullable<string>;

    panelId: Nullable<string>;

    _numberOfMonths: number = 1;

    _firstDayOfWeek!: number;

    _view: CalendarTypeView = 'date';

    preventFocus: Nullable<boolean>;

    _defaultDate!: Date;

    private window: Window;

    get locale() {
        return this._locale;
    }

    get iconButtonAriaLabel() {
        return this.iconAriaLabel ? this.iconAriaLabel : this.getTranslation('chooseDate');
    }

    get prevIconAriaLabel() {
        return this.currentView === 'year' ? this.getTranslation('prevDecade') : this.currentView === 'month' ? this.getTranslation('prevYear') : this.getTranslation('prevMonth');
    }

    get nextIconAriaLabel() {
        return this.currentView === 'year' ? this.getTranslation('nextDecade') : this.currentView === 'month' ? this.getTranslation('nextYear') : this.getTranslation('nextMonth');
    }

    constructor(@Inject(DOCUMENT) private document: Document, public el: ElementRef, public renderer: Renderer2, public cd: ChangeDetectorRef, private zone: NgZone, private config: PrimeNGConfig, public overlayService: OverlayService) {
        this.window = this.document.defaultView as Window;
    }

    ngOnInit() {
        this.attributeSelector = UniqueComponentId();
        this.panelId = this.attributeSelector + '_panel';
        const date = this.defaultDate || new Date();
        this.createResponsiveStyle();
        this.currentMonth = date.getMonth();
        this.currentYear = date.getFullYear();
        this.yearOptions = [];
        this.currentView = this.view;

        if (this.view === 'date') {
            this.createWeekDays();
            this.initTime(date);
            this.createMonths(this.currentMonth, this.currentYear);
            this.ticksTo1970 = ((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) + Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000;
        }

        this.translationSubscription = this.config.translationObserver.subscribe(() => {
            this.createWeekDays();
            this.cd.markForCheck();
        });

        this.initialized = true;
    }

        ngAfterContentInit() {
        this.setTemplate(this.templates, 'date');
        this.setTemplate(this.templates, 'decade');
        this.setTemplate(this.templates, 'disabledDate');
        this.setTemplate(this.templates, 'header');
        this.setTemplate(this.templates, 'inputicon');
        this.setTemplate(this.templates, 'previousicon');
        this.setTemplate(this.templates, 'nexticon');
        this.setTemplate(this.templates, 'triggericon');
        this.setTemplate(this.templates, 'clearicon');
        this.setTemplate(this.templates, 'decrementicon');
        this.setTemplate(this.templates, 'incrementicon');
        this.setTemplate(this.templates, 'footer');
    }
    
    setTemplate(templates, type) {
  const template = templates.find(item => item.getType() === type);
  
  if (template) {
    this.setTemplateByType(template, type);
  }
}

setTemplateByType(template, type) {
    const templateSetters = {
      'date': this.setDateTemplate,
      'decade': this.setDecadeTemplate,
      'disabledDate': this.setDisabledDateTemplate,
      'header': this.setHeaderTemplate,
      'inputicon': this.setInputIconTemplate,
      'previousicon': this.setPreviousIconTemplate,
      'nexticon': this.setNextIconTemplate,
      'triggericon': this.setTriggerIconTemplate,
      'clearicon': this.setClearIconTemplate,
      'decrementicon': this.setDecrementIconTemplate,
      'incrementicon': this.setIncrementIconTemplate,
      'footer': this.setFooterTemplate,
    };
  
    const templateSetter = templateSetters[type] || this.setDateTemplate;
    templateSetter.call(this, template);
  }
  

setDateTemplate(template) {
  this.dateTemplate = template.template;
}

setDecadeTemplate(template) {
  this.decadeTemplate = template.template;  
}

setDisabledDateTemplate(template) {
  this.disabledDateTemplate = template.template;
}

setHeaderTemplate(template) {
  this.headerTemplate = template.template;
}

setInputIconTemplate(template) {
  this.inputIconTemplate = template.template;
}

setPreviousIconTemplate(template) {
  this.previousIconTemplate = template.template;
}

setNextIconTemplate(template) {
  this.nextIconTemplate = template.template;
}

setTriggerIconTemplate(template) {
  this.triggerIconTemplate = template.template;
}

setClearIconTemplate(template) {
  this.clearIconTemplate = template.template;
}

setDecrementIconTemplate(template) {
  this.decrementIconTemplate = template.template; 
}

setIncrementIconTemplate(template) {
  this.incrementIconTemplate = template.template;
}

setFooterTemplate(template) {
  this.footerTemplate = template.template;
}




        ngAfterViewInit() {
        if (this.inline) {
            this.setInlineAttribute();
            this.initFocusableCellIfNotDisabled();
        }
    }
    
    setInlineAttribute() {
        if (this.contentViewChild && this.contentViewChild.nativeElement) {
            this.contentViewChild.nativeElement.setAttribute(this.attributeSelector, '');
        }
    }
    
    initFocusableCellIfNotDisabled() {
        if (!this.disabled && !this.inline) {
            this.initFocusableCell();
            
            if (this.numberOfMonths === 1) {
                this.setContentWidth();
            }
        }
    }
    
    setContentWidth() {
        if (this.contentViewChild && this.contentViewChild.nativeElement) {
            this.contentViewChild.nativeElement.style.width = DomHandler.getOuterWidth(this.containerViewChild?.nativeElement) + 'px';
        }
    }


    getTranslation(option: string) {
        return this.config.getTranslation(option);
    }

    populateYearOptions(start: number, end: number) {
        this.yearOptions = [];

        for (let i = start; i <= end; i++) {
            this.yearOptions.push(i);
        }
    }

    createWeekDays() {
        this.weekDays = [];
        let dayIndex = this.getFirstDateOfWeek();
        let dayLabels = this.getTranslation(TranslationKeys.DAY_NAMES_MIN);
        for (let i = 0; i < 7; i++) {
            this.weekDays.push(dayLabels[dayIndex]);
            dayIndex = dayIndex == 6 ? 0 : ++dayIndex;
        }
    }

    monthPickerValues() {
        let monthPickerValues = [];
        for (let i = 0; i <= 11; i++) {
            monthPickerValues.push(this.config.getTranslation('monthNamesShort')[i]);
        }

        return monthPickerValues;
    }

    yearPickerValues() {
        let yearPickerValues = [];
        let base = <number>this.currentYear - (<number>this.currentYear % 10);
        for (let i = 0; i < 10; i++) {
            yearPickerValues.push(base + i);
        }

        return yearPickerValues;
    }

    createMonths(month: number, year: number) {
        this.months = this.months = [];
        for (let i = 0; i < this.numberOfMonths; i++) {
            let m = month + i;
            let y = year;
            if (m > 11) {
                m = (m % 11) - 1;
                y = year + 1;
            }

            this.months.push(this.createMonth(m, y));
        }
    }

    getWeekNumber(date: Date) {
        let checkDate = new Date(date.getTime());
        if (this.startWeekFromFirstDayOfYear) {
            let firstDayOfWeek: number = +this.getFirstDateOfWeek();
            checkDate.setDate(checkDate.getDate() + 6 + firstDayOfWeek - checkDate.getDay());
        } else {
            checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
        }
        let time = checkDate.getTime();
        checkDate.setMonth(0);
        checkDate.setDate(1);
        return Math.floor(Math.round((time - checkDate.getTime()) / 86400000) / 7) + 1;
    }

    createMonth(month: number, year: number): Month {
    let dates = [];
    let firstDay = this.getFirstDayOfMonthIndex(month, year);
    let daysLength = this.getDaysCountInMonth(month, year);
    let prevMonthDaysLength = this.getDaysCountInPrevMonth(month, year);
    let dayNo = 1;
    let today = new Date();
    let weekNumbers = [];
    let monthRows = Math.ceil((daysLength + firstDay) / 7);

    for (let i = 0; i < monthRows; i++) {
        let week = [];

        if (i == 0) {
            for (let j = prevMonthDaysLength - firstDay + 1; j <= prevMonthDaysLength; j++) {
                let prev = this.getPreviousMonthAndYear(month, year);
                week.push({ day: j, month: prev.month, year: prev.year, otherMonth: true, today: this.isToday(today, j, prev.month, prev.year), selectable: this.isSelectable(j, prev.month, prev.year, true) });
            }

            let remainingDaysLength = 7 - week.length;
            for (let j = 0; j < remainingDaysLength; j++) {
                week.push({ day: dayNo, month: month, year: year, today: this.isToday(today, dayNo, month, year), selectable: this.isSelectable(dayNo, month, year, false) });
                dayNo++;
            }
        } else {
            let nextMonth = this.getNextMonthAndYear(month, year);
            
            let daysInWeek = 0;
            while (daysInWeek < 7) {
                if (dayNo > daysLength) {
                    week.push({
                        day: dayNo - daysLength,
                        month: nextMonth.month,
                        year: nextMonth.year,
                        otherMonth: true,
                        today: this.isToday(today, dayNo - daysLength, nextMonth.month, nextMonth.year),
                        selectable: this.isSelectable(dayNo - daysLength, nextMonth.month, nextMonth.year, true)
                    });
                } else {
                    week.push({ day: dayNo, month: month, year: year, today: this.isToday(today, dayNo, month, year), selectable: this.isSelectable(dayNo, month, year, false) });
                }

                dayNo++;
                daysInWeek++;
            }
        }

        if (this.showWeek) {
            weekNumbers.push(this.getWeekNumber(new Date(week[0].year, week[0].month, week[0].day)));
        }

        dates.push(week);
    }

    return {
        month: month,
        year: year,
        dates: dates,
        weekNumbers: weekNumbers
    };
}



    initTime(date: Date) {
        this.pm = date.getHours() > 11;

        if (this.showTime) {
            this.currentMinute = date.getMinutes();
            this.currentSecond = date.getSeconds();
            this.setCurrentHourPM(date.getHours());
        } else if (this.timeOnly) {
            this.currentMinute = 0;
            this.currentHour = 0;
            this.currentSecond = 0;
        }
    }

    navBackward(event: any) {
        if (this.disabled) {
            event.preventDefault();
            return;
        }

        this.isMonthNavigate = true;

        if (this.currentView === 'month') {
            this.decrementYear();
            setTimeout(() => {
                this.updateFocus();
            }, 1);
        } else if (this.currentView === 'year') {
            this.decrementDecade();
            setTimeout(() => {
                this.updateFocus();
            }, 1);
        } else {
            if (this.currentMonth === 0) {
                this.currentMonth = 11;
                this.decrementYear();
            } else {
                this.currentMonth--;
            }

            this.onMonthChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }

    navForward(event: any) {
        if (this.disabled) {
            event.preventDefault();
            return;
        }

        this.isMonthNavigate = true;

        if (this.currentView === 'month') {
            this.incrementYear();
            setTimeout(() => {
                this.updateFocus();
            }, 1);
        } else if (this.currentView === 'year') {
            this.incrementDecade();
            setTimeout(() => {
                this.updateFocus();
            }, 1);
        } else {
            if (this.currentMonth === 11) {
                this.currentMonth = 0;
                this.incrementYear();
            } else {
                this.currentMonth++;
            }

            this.onMonthChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }

    decrementYear() {
        this.currentYear--;
        let _yearOptions = <number[]>this.yearOptions;

        if (this.yearNavigator && this.currentYear < _yearOptions[0]) {
            let difference = _yearOptions[_yearOptions.length - 1] - _yearOptions[0];
            this.populateYearOptions(_yearOptions[0] - difference, _yearOptions[_yearOptions.length - 1] - difference);
        }
    }

    decrementDecade() {
        this.currentYear = this.currentYear - 10;
    }

    incrementDecade() {
        this.currentYear = this.currentYear + 10;
    }

    incrementYear() {
        this.currentYear++;
        let _yearOptions = <number[]>this.yearOptions;

        if (this.yearNavigator && this.currentYear > _yearOptions[_yearOptions.length - 1]) {
            let difference = _yearOptions[_yearOptions.length - 1] - _yearOptions[0];
            this.populateYearOptions(_yearOptions[0] + difference, _yearOptions[_yearOptions.length - 1] + difference);
        }
    }

    switchToMonthView(event: Event) {
        this.setCurrentView('month');
        event.preventDefault();
    }

    switchToYearView(event: Event) {
        this.setCurrentView('year');
        event.preventDefault();
    }

        onDateSelect(event: Event, dateMeta: any) {
        if (this.disabled || !dateMeta.selectable) {
            event.preventDefault();
            return;
        }

        this.handleMultipleSelection(event, dateMeta);

        this.handleSingleOrRangeSelection();

        this.updateInputfield();
        event.preventDefault();
    }

    handleMultipleSelection(event: Event, dateMeta: any) {
        if (this.isMultipleSelection() && this.isSelected(dateMeta)) {
            this.removeDateFromValue(dateMeta);
        } else {
            if (this.shouldSelectDate(dateMeta)) {
                this.selectDate(dateMeta); 
            }
        }
    }

            handleSingleOrRangeSelection() {
      if (this.isSingleSelection() && this.hideOnDateTimeSelect) {
        
        this.hideOverlayOnSingleSelection();
      }
      
      if (this.isRangeSelection() && this.value[1]) {
        
        this.hideOverlayOnRangeSelection();  
      }
    }

    hideOverlayOnSingleSelection() {
      setTimeout(() => {
        event.preventDefault();
        this.hideOverlay();

        if (this.mask) {
          this.disableModality();
        }

        this.cd.markForCheck();
      }, 150);
    }

    hideOverlayOnRangeSelection() {
      setTimeout(() => {
        event.preventDefault();
        this.hideOverlay();

        if (this.mask) {
          this.disableModality();
        }

        this.cd.markForCheck();
      }, 150);
    }



    removeDateFromValue(dateMeta: any) {
        this.value = this.value.filter((date: Date, i: number) => {
            return !this.isDateEquals(date, dateMeta); 
        });
        
        if (this.value.length === 0) {
            this.value = null;
        }
        
        this.updateModel(this.value);
    }


    shouldSelectDate(dateMeta: any) {
        if (this.isMultipleSelection()) return this.maxDateCount != null ? this.maxDateCount > (this.value ? this.value.length : 0) : true;
        else return true;
    }

    onMonthSelect(event: Event, index: number) {
        if (this.view === 'month') {
            this.onDateSelect(event, { year: this.currentYear, month: index, day: 1, selectable: true });
        } else {
            this.currentMonth = index;
            this.createMonths(this.currentMonth, this.currentYear);
            this.setCurrentView('date');
            this.onMonthChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
        }
    }

    onYearSelect(event: Event, year: number) {
        if (this.view === 'year') {
            this.onDateSelect(event, { year: year, month: 0, day: 1, selectable: true });
        } else {
            this.currentYear = year;
            this.setCurrentView('month');
            this.onYearChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
        }
    }

    updateInputfield() {
    let formattedValue = '';

    if (this.value) {
        formattedValue = this.getFormattedValue();
    }

    this.inputFieldValue = formattedValue;
    this.updateFilledState();
    if (this.inputfieldViewChild && this.inputfieldViewChild.nativeElement) {
        this.inputfieldViewChild.nativeElement.value = this.inputFieldValue;
    }
}

getFormattedValue() {
  if (this.isSingleSelection()) {
      return this.formatDateTime(this.value);
  } else if (this.isMultipleSelection()) {
      return this.getFormattedMultipleSelection();
  } else if (this.isRangeSelection()) {
      return this.getFormattedRangeSelection();
  }

  return '';
}

getFormattedMultipleSelection() {
  let formattedValue = '';
  for (let i = 0; i < this.value.length; i++) {
      let dateAsString = this.formatDateTime(this.value[i]);
      formattedValue += dateAsString;
      if (i !== this.value.length - 1) {
          formattedValue += this.multipleSeparator + ' ';
      }
  }
  
  return formattedValue;
}

getFormattedRangeSelection() {
  let formattedValue = '';
  
  if (this.value && this.value.length) {
      let startDate = this.value[0];
      let endDate = this.value[1];

      formattedValue = this.formatDateTime(startDate);
      if (endDate) {
          formattedValue += ' ' + this.rangeSeparator + ' ' + this.formatDateTime(endDate);
      }
  }

  return formattedValue;
}


            formatDateTime(date: any) {
        let formattedValue: string | null;

        if (this.isValidDate(date)) {
            if (this.timeOnly) {
                formattedValue = this.formatTime(date);
            } else {
                formattedValue = this.formatDate(date, this.getDateFormat());
                if (this.showTime) {
                    formattedValue += ' ' + this.formatTime(date);
                }
            }
        } else if (this.dataType === 'string') {
            formattedValue = date; 
        } else {
            formattedValue = this.keepInvalid ? date : null;
        }

        return formattedValue;
    }



    setCurrentHourPM(hours: number) {
        if (this.hourFormat == '12') {
            this.pm = hours > 11;
            if (hours >= 12) {
                this.currentHour = hours == 12 ? 12 : hours - 12;
            } else {
                this.currentHour = hours == 0 ? 12 : hours;
            }
        } else {
            this.currentHour = hours;
        }
    }

    setCurrentView(currentView: CalendarTypeView) {
        this.currentView = currentView;
        this.cd.detectChanges();
        this.alignOverlay();
    }

        selectDate(dateMeta: any) {

        let date = new Date(dateMeta.year, dateMeta.month, dateMeta.day);

        this.setTimeOnDate(date);

        this.adjustDateIfOutsideMinMax(date);
        
        if (this.isSingleSelection()) {
            this.updateModelForSingleSelection(date);
        } else if (this.isMultipleSelection()) {
            this.updateModelForMultipleSelection(date);
        } else if (this.isRangeSelection()) {
            this.updateModelForRangeSelection(date);
        }

        this.onSelect.emit(date);
    }

    setTimeOnDate(date: Date) {
        if (this.showTime) {
            if (this.hourFormat == '12') {
                if (this.currentHour === 12) date.setHours(this.pm ? 12 : 0);
                else date.setHours(this.pm ? <number>this.currentHour + 12 : <number>this.currentHour);
            } else {
                date.setHours(<number>this.currentHour);
            }

            date.setMinutes(<number>this.currentMinute);
            date.setSeconds(<number>this.currentSecond);
        }
    }

    adjustDateIfOutsideMinMax(date: Date) {
        if (this.minDate && this.minDate > date) {
            date = this.minDate;
            this.setCurrentHourPM(date.getHours());
            this.currentMinute = date.getMinutes();
            this.currentSecond = date.getSeconds();
        }

        if (this.maxDate && this.maxDate < date) {
            date = this.maxDate;
            this.setCurrentHourPM(date.getHours());
            this.currentMinute = date.getMinutes();
            this.currentSecond = date.getSeconds();
        }
    }

    updateModelForSingleSelection(date: Date) {
        this.updateModel(date);
    }

    updateModelForMultipleSelection(date: Date) {
        this.updateModel(this.value ? [...this.value, date] : [date]);
    }

    updateModelForRangeSelection(date: Date) {
        if (this.value && this.value.length) {
            let startDate = this.value[0];
            let endDate = this.value[1];

            if (!endDate && date.getTime() >= startDate.getTime()) {
                endDate = date;
            } else {
                startDate = date;
                endDate = null;
            }

            this.updateModel([startDate, endDate]);
        } else {
            this.updateModel([date, null]);
        }
    }


    updateModel(value: any) {
  this.value = value;

  if (this.dataType === 'date') {
    this.onModelChange(this.value);
  } else if (this.dataType === 'string') {
    if (this.isSingleSelection()) {
      this.onModelChange(this.formatDateTime(this.value));
    } else {
      let stringArrValue = null;
      if (Array.isArray(this.value)) {
        stringArrValue = this.value.map(date => this.formatDateTime(date)); 
      }
      this.onModelChange(stringArrValue);
    }
  }
}


    getFirstDayOfMonthIndex(month: number, year: number) {
        let day = new Date();
        day.setDate(1);
        day.setMonth(month);
        day.setFullYear(year);

        let dayIndex = day.getDay() + this.getSundayIndex();
        return dayIndex >= 7 ? dayIndex - 7 : dayIndex;
    }

    getDaysCountInMonth(month: number, year: number) {
        return 32 - this.daylightSavingAdjust(new Date(year, month, 32)).getDate();
    }

    getDaysCountInPrevMonth(month: number, year: number) {
        let prev = this.getPreviousMonthAndYear(month, year);
        return this.getDaysCountInMonth(prev.month, prev.year);
    }

    getPreviousMonthAndYear(month: number, year: number) {
        let m, y;

        if (month === 0) {
            m = 11;
            y = year - 1;
        } else {
            m = month - 1;
            y = year;
        }

        return { month: m, year: y };
    }

    getNextMonthAndYear(month: number, year: number) {
        let m, y;

        if (month === 11) {
            m = 0;
            y = year + 1;
        } else {
            m = month + 1;
            y = year;
        }

        return { month: m, year: y };
    }

    getSundayIndex() {
        let firstDayOfWeek = this.getFirstDateOfWeek();

        return firstDayOfWeek > 0 ? 7 - firstDayOfWeek : 0;
    }

    isSelected(dateMeta: any): boolean | undefined {
  if (!this.value) {
    return false;
  }

  if (this.isSingleSelection()) {
    return this.isDateEquals(this.value, dateMeta);
  }

  if (this.isMultipleSelection()) {
    return this.value.some(date => this.isDateEquals(date, dateMeta));
  }

  if (this.isRangeSelection()) {
    const [start, end] = this.value;
    return (
      this.isDateEquals(start, dateMeta) ||
      this.isDateEquals(end, dateMeta) || 
      this.isDateBetween(start, end, dateMeta)
    );
  }
}


    isComparable() {
        return this.value != null && typeof this.value !== 'string';
    }

    isMonthSelected(month: number) {
        if (this.isComparable() && !this.isMultipleSelection()) {
            const [start, end] = this.isRangeSelection() ? this.value : [this.value, this.value];
            const selected = new Date(this.currentYear, month, 1);
            return selected >= start && selected <= (end ?? start);
        }
        return false;
    }

    isMonthDisabled(month: number, year?: number) {
        const yearToCheck = year ?? this.currentYear;

        for (let day = 1; day < this.getDaysCountInMonth(month, yearToCheck) + 1; day++) {
            if (this.isSelectable(day, month, yearToCheck, false)) {
                return false;
            }
        }
        return true;
    }

    isYearDisabled(year: number) {
        return Array(12)
            .fill(0)
            .every((v, month) => this.isMonthDisabled(month, year));
    }

    isYearSelected(year: number) {
        if (this.isComparable()) {
            let value = this.isRangeSelection() ? this.value[0] : this.value;

            return !this.isMultipleSelection() ? value.getFullYear() === year : false;
        }

        return false;
    }

    isDateEquals(value: any, dateMeta: any) {
        if (value && ObjectUtils.isDate(value)) return value.getDate() === dateMeta.day && value.getMonth() === dateMeta.month && value.getFullYear() === dateMeta.year;
        else return false;
    }

    isDateBetween(start: Date, end: Date, dateMeta: any) {
        let between: boolean = false;
        if (ObjectUtils.isDate(start) && ObjectUtils.isDate(end)) {
            let date: Date = new Date(dateMeta.year, dateMeta.month, dateMeta.day);
            return start.getTime() <= date.getTime() && end.getTime() >= date.getTime();
        }

        return between;
    }

    isSingleSelection(): boolean {
        return this.selectionMode === 'single';
    }

    isRangeSelection(): boolean {
        return this.selectionMode === 'range';
    }

    isMultipleSelection(): boolean {
        return this.selectionMode === 'multiple';
    }

    isToday(today: Date, day: number, month: number, year: number): boolean {
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    }

        isSelectable(day: any, month: any, year: any, otherMonth: any): boolean {

        if (otherMonth && !this.selectOtherMonths) {
            return false;
        }

        const validMin = this.checkMinDate(day, month, year);
        const validMax = this.checkMaxDate(day, month, year);
        const validDate = !this.isDateDisabled(day, month, year);
        const validDay = !this.isDayDisabled(day, month, year);

        return validMin && validMax && validDate && validDay;
    }

    checkMinDate(day: number, month: number, year: number) {
        if (!this.minDate) {
            return true;
        }

        if (this.minDate.getFullYear() > year) {
            return false;
        }

        if (this.minDate.getFullYear() === year && this.currentView != 'year') {
            if (this.minDate.getMonth() > month) {
                return false;
            }

            if (this.minDate.getMonth() === month && this.minDate.getDate() > day) {
                return false;
            }
        }

        return true;
    }

    checkMaxDate(day: number, month: number, year: number) {
        if (!this.maxDate) {
            return true;
        }

        if (this.maxDate.getFullYear() < year) {
            return false;
        }

        if (this.maxDate.getFullYear() === year) {
            if (this.maxDate.getMonth() < month) {
                return false;
            }

            if (this.maxDate.getMonth() === month && this.maxDate.getDate() < day) {
                return false;
            }
        }

        return true;
    }


isDateDisabled(day: number, month: number, year: number): boolean {
    if (this.disabledDates) {
        const dateToCheck = new Date(year, month, day);
        return this.disabledDates.some(disabledDate => disabledDate.getTime() === dateToCheck.getTime());
    }
    return false;
}





    isDayDisabled(day: number, month: number, year: number): boolean {
        if (this.disabledDays) {
            let weekday = new Date(year, month, day);
            let weekdayNumber = weekday.getDay();
            return this.disabledDays.indexOf(weekdayNumber) !== -1;
        }
        return false;
    }

    onInputFocus(event: Event) {
        this.focus = true;
        if (this.showOnFocus) {
            this.showOverlay();
        }
        this.onFocus.emit(event);
    }

    onInputClick() {
        if (this.showOnFocus && !this.overlayVisible) {
            this.showOverlay();
        }
    }

    onInputBlur(event: Event) {
        this.focus = false;
        this.onBlur.emit(event);
        if (!this.keepInvalid) {
            this.updateInputfield();
        }
        this.onModelTouched();
    }

    onButtonClick(event: Event, inputfield: any = this.inputfieldViewChild?.nativeElement) {
        if (!this.overlayVisible) {
            inputfield.focus();
            this.showOverlay();
        } else {
            this.hideOverlay();
        }
    }

    clear() {
        this.inputFieldValue = null;
        this.value = null;
        this.onModelChange(this.value);
        this.onClear.emit();
    }

    onOverlayClick(event: Event) {
        this.overlayService.add({
            originalEvent: event,
            target: this.el.nativeElement
        });
    }

    getMonthName(index: number) {
        return this.config.getTranslation('monthNames')[index];
    }

    getYear(month: any) {
        return this.currentView === 'month' ? this.currentYear : month.year;
    }

    switchViewButtonDisabled() {
        return this.numberOfMonths > 1 || this.disabled;
    }

    onPrevButtonClick(event: Event) {
        this.navigationState = { backward: true, button: true };
        this.navBackward(event);
    }

    onNextButtonClick(event: Event) {
        this.navigationState = { backward: false, button: true };
        this.navForward(event);
    }

onContainerButtonKeydown(event: KeyboardEvent) {
    switch (event.code) {
        //tab
        case 'Tab':
            if (!this.inline) {
                this.trapFocus(event);
            }
            if (this.inline) {
                const headerElements = DomHandler.findSingle(this.containerViewChild?.nativeElement, '.p-datepicker-header');
                const element = event.target as HTMLElement;
                if (element === headerElements.children[headerElements.children.length - 1]) {
                    this.initFocusableCell();
                }
            }
            break;
        
        //escape
        case 'Escape':
            this.inputfieldViewChild?.nativeElement.focus();
            this.overlayVisible = false;
            event.preventDefault();
            break;
        
        default:
            // No operation
            break;
    }
}

    onInputKeydown(event: any) {

  if (event.keyCode === 40 && this.contentViewChild) {
    this.trapFocus(event);
  }

  else if (event.keyCode === 27) {
    this.handleEscape(); 
  }

  else if (event.keyCode === 13) {
    this.handleEnter();
  }

  else if (event.keyCode === 9 && this.contentViewChild) {
    this.handleTab();
  }

  this.isKeydown = true;

}

handleEscape() {
  if (this.overlayVisible) {
    this.handleEscapeKey(event); 
  }
}

handleEnter() {
  if (this.overlayVisible) {
    this.handleEnterKey();
  }
} 

handleTab() {
  this.handleTabKey();
}


handleEscapeKey(event: any) {
  this.inputfieldViewChild?.nativeElement.focus();
  this.overlayVisible = false;
  event.preventDefault();
}

handleEnterKey() {
  this.overlayVisible = false;
  event.preventDefault(); 
}

handleTabKey() {
  DomHandler.getFocusableElements(this.contentViewChild.nativeElement).forEach((el) => (el.tabIndex = '-1'));
  if (this.overlayVisible) {
    this.overlayVisible = false; 
  }
}


    onDateCellKeydown(event: any, date: Date, groupIndex: number) {
        const cellContent = event.currentTarget;
        const cell = cellContent.parentElement;

        switch (event.which) {
            //down arrow
            case 40: {
                cellContent.tabIndex = '-1';
                let cellIndex = DomHandler.index(cell);
                let nextRow = cell.parentElement.nextElementSibling;
                if (nextRow) {
                    let focusCell = nextRow.children[cellIndex].children[0];
                    if (DomHandler.hasClass(focusCell, 'p-disabled')) {
                        this.navigationState = { backward: false };
                        this.navForward(event);
                    } else {
                        nextRow.children[cellIndex].children[0].tabIndex = '0';
                        nextRow.children[cellIndex].children[0].focus();
                    }
                } else {
                    this.navigationState = { backward: false };
                    this.navForward(event);
                }
                event.preventDefault();
                break;
            }

            //up arrow
            case 38: {
                cellContent.tabIndex = '-1';
                let cellIndex = DomHandler.index(cell);
                let prevRow = cell.parentElement.previousElementSibling;
                if (prevRow) {
                    let focusCell = prevRow.children[cellIndex].children[0];
                    if (DomHandler.hasClass(focusCell, 'p-disabled')) {
                        this.navigationState = { backward: true };
                        this.navBackward(event);
                    } else {
                        focusCell.tabIndex = '0';
                        focusCell.focus();
                    }
                } else {
                    this.navigationState = { backward: true };
                    this.navBackward(event);
                }
                event.preventDefault();
                break;
            }

            //left arrow
            case 37: {
                cellContent.tabIndex = '-1';
                let prevCell = cell.previousElementSibling;
                if (prevCell) {
                    let focusCell = prevCell.children[0];
                    if (DomHandler.hasClass(focusCell, 'p-disabled') || DomHandler.hasClass(focusCell.parentElement, 'p-datepicker-weeknumber')) {
                        this.navigateToMonth(true, groupIndex);
                    } else {
                        focusCell.tabIndex = '0';
                        focusCell.focus();
                    }
                } else {
                    this.navigateToMonth(true, groupIndex);
                }
                event.preventDefault();
                break;
            }

            //right arrow
            case 39: {
                cellContent.tabIndex = '-1';
                let nextCell = cell.nextElementSibling;
                if (nextCell) {
                    let focusCell = nextCell.children[0];
                    if (DomHandler.hasClass(focusCell, 'p-disabled')) {
                        this.navigateToMonth(false, groupIndex);
                    } else {
                        focusCell.tabIndex = '0';
                        focusCell.focus();
                    }
                } else {
                    this.navigateToMonth(false, groupIndex);
                }
                event.preventDefault();
                break;
            }

            //enter
            //space
            case 13:
            case 32: {
                this.onDateSelect(event, date);
                event.preventDefault();
                break;
            }

            //escape
            case 27: {
                this.inputfieldViewChild?.nativeElement.focus();
                this.overlayVisible = false;
                event.preventDefault();
                break;
            }

            //tab
            case 9: {
                if (!this.inline) {
                    this.trapFocus(event);
                }
                break;
            }

            default:
                //no op
                break;
        }
    }

onMonthCellKeydown(event: any, index: number) {
    const cell = event.currentTarget;
    switch (event.which) {
        //arrows
        case 38:
        case 40: {
            cell.tabIndex = '-1';
            const cells = cell.parentElement.children;
            const cellIndex = DomHandler.index(cell);
            const nextCellIndex = event.which === 40 ? cellIndex + 3 : cellIndex - 3;
            const nextCell = cells[nextCellIndex];
            if (nextCell) {
                nextCell.tabIndex = '0';
                nextCell.focus();
            }
            event.preventDefault();
            break;
        }

        //left arrow
        case 37: {
            cell.tabIndex = '-1';
            const prevCell = cell.previousElementSibling;
            if (prevCell) {
                prevCell.tabIndex = '0';
                prevCell.focus();
            } else {
                this.navigationState = { backward: true };
                this.navBackward(event);
            }
            event.preventDefault();
            break;
        }

        //right arrow
        case 39: {
            cell.tabIndex = '-1';
            const nextCell = cell.nextElementSibling;
            if (nextCell) {
                nextCell.tabIndex = '0';
                nextCell.focus();
            } else {
                this.navigationState = { backward: false };
                this.navForward(event);
            }
            event.preventDefault();
            break;
        }

        //enter
        //space
        case 13:
        case 32: {
            this.onMonthSelect(event, index);
            event.preventDefault();
            break;
        }

        //escape
        case 27: {
            this.inputfieldViewChild?.nativeElement.focus();
            this.overlayVisible = false;
            event.preventDefault();
            break;
        }

        //tab
        case 9: {
            if (!this.inline) {
                this.trapFocus(event);
            }
            break;
        }

        default:
            //no op
            break;
    }
}

    onYearCellKeydown(event: any, index: number) {
        const cell = event.currentTarget;

        switch (event.which) {
            //arrows
            case 38:
            case 40: {
                cell.tabIndex = '-1';
                var cells = cell.parentElement.children;
                var cellIndex = DomHandler.index(cell);
                let nextCell = cells[event.which === 40 ? cellIndex + 2 : cellIndex - 2];
                if (nextCell) {
                    nextCell.tabIndex = '0';
                    nextCell.focus();
                }
                event.preventDefault();
                break;
            }

            //left arrow
            case 37: {
                cell.tabIndex = '-1';
                let prevCell = cell.previousElementSibling;
                if (prevCell) {
                    prevCell.tabIndex = '0';
                    prevCell.focus();
                } else {
                    this.navigationState = { backward: true };
                    this.navBackward(event);
                }

                event.preventDefault();
                break;
            }

            //right arrow
            case 39: {
                cell.tabIndex = '-1';
                let nextCell = cell.nextElementSibling;
                if (nextCell) {
                    nextCell.tabIndex = '0';
                    nextCell.focus();
                } else {
                    this.navigationState = { backward: false };
                    this.navForward(event);
                }

                event.preventDefault();
                break;
            }

            //enter
            //space
            case 13:
            case 32: {
                this.onYearSelect(event, index);
                event.preventDefault();
                break;
            }

            //escape
            case 27: {
                this.inputfieldViewChild?.nativeElement.focus();
                this.overlayVisible = false;
                event.preventDefault();
                break;
            }

            //tab
            case 9: {
                this.trapFocus(event);
                break;
            }

            default:
                //no op
                break;
        }
    }

    navigateToMonth(prev: any, groupIndex: number) {
        if (prev) {
            if (this.numberOfMonths === 1 || groupIndex === 0) {
                this.navigationState = { backward: true };
                this.navBackward(event);
            } else {
                let prevMonthContainer = this.contentViewChild.nativeElement.children[groupIndex - 1];
                let cells = DomHandler.find(prevMonthContainer, '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)');
                let focusCell = cells[cells.length - 1];
                focusCell.tabIndex = '0';
                focusCell.focus();
            }
        } else {
            if (this.numberOfMonths === 1 || groupIndex === this.numberOfMonths - 1) {
                this.navigationState = { backward: false };
                this.navForward(event);
            } else {
                let nextMonthContainer = this.contentViewChild.nativeElement.children[groupIndex + 1];
                let focusCell = DomHandler.findSingle(nextMonthContainer, '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)');
                focusCell.tabIndex = '0';
                focusCell.focus();
            }
        }
    }

            updateFocus() {
        let cell;

        if (this.navigationState) {
            if (this.navigationState.button) {
                this.initFocusableCell();

                if (this.navigationState.backward) {
                    DomHandler.findSingle(this.contentViewChild.nativeElement, '.p-datepicker-prev').focus();
                } else {
                    DomHandler.findSingle(this.contentViewChild.nativeElement, '.p-datepicker-next').focus();
                }
            } else {
                if (this.navigationState.backward) {
                    let cells = this.getFocusableCells();
                    if (cells && cells.length > 0) {
                        cell = cells[cells.length - 1];
                    }
                } else {
                    cell = this.getInitialFocusableCell();
                }

                if (cell) {
                    cell.tabIndex = '0';
                    cell.focus();
                }
            }

            this.navigationState = null;
        } else {
            this.initFocusableCell();
        }
    }

    getFocusableCells() {
        let cells;
        if (this.currentView === 'month') {
            cells = DomHandler.find(this.contentViewChild.nativeElement, '.p-monthpicker .p-monthpicker-month:not(.p-disabled)');
        } else if (this.currentView === 'year') {
            cells = DomHandler.find(this.contentViewChild.nativeElement, '.p-yearpicker .p-yearpicker-year:not(.p-disabled)');
        } else {
            cells = DomHandler.find(this.contentViewChild.nativeElement, '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)');
        }
        return cells;
    }

    getInitialFocusableCell() {
        let cell;
        if (this.currentView === 'month') {
            cell = DomHandler.findSingle(this.contentViewChild.nativeElement, '.p-monthpicker .p-monthpicker-month:not(.p-disabled)');
        } else if (this.currentView === 'year') {
            cell = DomHandler.findSingle(this.contentViewChild.nativeElement, '.p-yearpicker .p-yearpicker-year:not(.p-disabled)');
        } else {
            cell = DomHandler.findSingle(this.contentViewChild.nativeElement, '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)');
        }
        return cell;
    }


        initFocusableCell() {
      const contentEl = this.contentViewChild?.nativeElement;
      
      let cell;

      if (this.currentView === 'month') {
        cell = this.getFocusableCellForMonthView(contentEl);
      } else if (this.currentView === 'year') {
        cell = this.getFocusableCellForYearView(contentEl);
      } else {
        cell = this.getFocusableCellForDateView(contentEl);
      }

      if (cell) {
        this.setFocusableCell(cell);
      }
    }

    getFocusableCellForMonthView(contentEl) {
      let cells = DomHandler.find(contentEl, '.p-monthpicker .p-monthpicker-month:not(.p-disabled)');
      let selectedCell = DomHandler.findSingle(contentEl, '.p-monthpicker .p-monthpicker-month.p-highlight');
      cells.forEach(cell => cell.tabIndex = -1);
      return selectedCell || cells[0];
    }

    getFocusableCellForYearView(contentEl) {
      let cells = DomHandler.find(contentEl, '.p-yearpicker .p-yearpicker-year:not(.p-disabled)');
      let selectedCell = DomHandler.findSingle(contentEl, '.p-yearpicker .p-yearpicker-year.p-highlight');
      cells.forEach(cell => cell.tabIndex = -1);
      return selectedCell || cells[0];
    }

    getFocusableCellForDateView(contentEl) {
      let cell = DomHandler.findSingle(contentEl, 'span.p-highlight');
      if (!cell) {
        let todayCell = DomHandler.findSingle(contentEl, 'td.p-datepicker-today span:not(.p-disabled):not(.p-ink)');
        if (todayCell) cell = todayCell;
        else cell = DomHandler.findSingle(contentEl, '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)');
      }
      return cell;
    }

    setFocusableCell(cell) {
  cell.tabIndex = '0';
  
  const shouldFocusCell = !this.preventFocus 
    && (!this.navigationState || !this.navigationState.button);

  if (shouldFocusCell) {
    setTimeout(() => {
      if (!this.disabled) {
        cell.focus();
      }
    }, 1);
  }

  this.preventFocus = false;
}



trapFocus(event: any) {
    const focusableElements = DomHandler.getFocusableElements(this.contentViewChild.nativeElement);

    if (focusableElements && focusableElements.length > 0) {
        const activeElement = focusableElements[0].ownerDocument.activeElement;

        if (!activeElement) {
            focusableElements[0].focus();
        } else {
            const focusedIndex = focusableElements.indexOf(activeElement);

            if (event.shiftKey) {
                if (focusedIndex === -1 || focusedIndex === 0) {
                    if (this.focusTrap) {
                        focusableElements[focusableElements.length - 1].focus();
                    } else {
                        if (focusedIndex === -1) {
                            this.hideOverlay();
                            return;
                        }
                    }
                } else {
                    focusableElements[focusedIndex - 1].focus();
                }
            } else {
                if (focusedIndex === -1) {
                    if (this.timeOnly) {
                        focusableElements[0].focus();
                    } else {
                        let spanIndex = focusableElements.findIndex(el => el.tagName === 'SPAN');
                        focusableElements[spanIndex].focus();
                    }
                } else if (focusedIndex === focusableElements.length - 1) {
                    if (!this.focusTrap) {
                        this.hideOverlay();
                        return;
                    }
                    focusableElements[0].focus();
                } else {
                    focusableElements[focusedIndex + 1].focus();
                }
            }
        }
    }

    event.preventDefault();
}

    onMonthDropdownChange(m: string) {
        this.currentMonth = parseInt(m);
        this.onMonthChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
        this.createMonths(this.currentMonth, this.currentYear);
    }

    onYearDropdownChange(y: string) {
        this.currentYear = parseInt(y);
        this.onYearChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
        this.createMonths(this.currentMonth, this.currentYear);
    }

    convertTo24Hour = function (hours: number, pm: boolean) {
        //@ts-ignore
        if (this.hourFormat == '12') {
            if (hours === 12) {
                return pm ? 12 : 0;
            } else {
                return pm ? hours + 12 : hours;
            }
        }
        return hours;
    };

    constrainTime(hour: number, minute: number, second: number, pm: boolean): number[] {
        const convertedHour = this.convertTo24Hour(hour, pm);
        const [isMinDate, minDate] = this.checkMinDateConstraints(convertedHour, minute, second);
        const [isMaxDate, maxDate] = this.checkMaxDateConstraints(convertedHour, minute, second);
    
        let returnTimeTriple = [hour, minute, second];
    
        if (isMinDate) {
            returnTimeTriple = this.applyMinDateConstraints(returnTimeTriple, minDate, convertedHour);
        } else if (isMaxDate) {
            returnTimeTriple = this.applyMaxDateConstraints(returnTimeTriple, maxDate, convertedHour);
        }
    
        return returnTimeTriple;
    }
    
    private checkMinDateConstraints(hour: number, minute: number, second: number): [boolean, Date | null] {
        let value = this.getValueForComparison();
        if (!this.minDate || !value) return [false, null];
    
        const isMinDate = this.minDate.toDateString() === value.toDateString();
        return [isMinDate, isMinDate ? this.minDate : null];
    }
    
    private checkMaxDateConstraints(hour: number, minute: number, second: number): [boolean, Date | null] {
        let value = this.getValueForComparison();
        if (!this.maxDate || !value) return [false, null];
    
        const isMaxDate = this.maxDate.toDateString() === value.toDateString();
        return [isMaxDate, isMaxDate ? this.maxDate : null];
    }
    
    private getValueForComparison(): Date | null {
        if (!this.value) return null;
    
        if (this.isRangeSelection()) {
            return this.value[1] || this.value[0];
        } else if (this.isMultipleSelection()) {
            return this.value[this.value.length - 1];
        }
    
        return this.value;
    }
    
    private applyMinDateConstraints(time: number[], minDate: Date, hour: number): number[] {
        if (minDate.getHours() > hour) {
            time[0] = minDate.getHours();
        }
        if (minDate.getHours() === hour) {
            if (minDate.getMinutes() > time[1]) {
                time[1] = minDate.getMinutes();
            }
            if (minDate.getMinutes() === time[1] && minDate.getSeconds() > time[2]) {
                time[2] = minDate.getSeconds();
            }
        }
        return time;
    }
    
    private applyMaxDateConstraints(time: number[], maxDate: Date, hour: number): number[] {
        if (maxDate.getHours() < hour) {
            time[0] = maxDate.getHours();
        }
        if (maxDate.getHours() === hour) {
            if (maxDate.getMinutes() < time[1]) {
                time[1] = maxDate.getMinutes();
            }
            if (maxDate.getMinutes() === time[1] && maxDate.getSeconds() < time[2]) {
                time[2] = maxDate.getSeconds();
            }
        }
        return time;
    }
    

    incrementHour(event: any) {
        const prevHour = this.currentHour ?? 0;
        let newHour = (this.currentHour ?? 0) + this.stepHour;
        let newPM = this.pm;
        if (this.hourFormat == '24')
            newHour = newHour >= 24 ? newHour - 24 : newHour;
        else if (this.hourFormat == '12') {
            // Before the AM/PM break, now after
            if (prevHour < 12 && newHour > 11) {
                newPM = !this.pm;
            }
            newHour = newHour >= 13 ? newHour - 12 : newHour;
        }
        [ this.currentHour, this.currentMinute, this.currentSecond ] = this.constrainTime(newHour, this.currentMinute!, this.currentSecond!, newPM!);
        this.pm = newPM;
        event.preventDefault();
    }

    onTimePickerElementMouseDown(event: Event, type: number, direction: number) {
        if (!this.disabled) {
            this.repeat(event, null, type, direction);
            event.preventDefault();
        }
    }

    onTimePickerElementMouseUp(event: Event) {
        if (!this.disabled) {
            this.clearTimePickerTimer();
            this.updateTime();
        }
    }

    onTimePickerElementMouseLeave() {
        if (!this.disabled && this.timePickerTimer) {
            this.clearTimePickerTimer();
            this.updateTime();
        }
    }

    repeat(event: Event | null, interval: number | null, type: number | null, direction: number | null) {
        let i = interval || 500;

        this.clearTimePickerTimer();
        this.timePickerTimer = setTimeout(() => {
            this.repeat(event, 100, type, direction);
            this.cd.markForCheck();
        }, i);

        switch (type) {
            case 0:
                if (direction === 1) this.incrementHour(event);
                else this.decrementHour(event);
                break;

            case 1:
                if (direction === 1) this.incrementMinute(event);
                else this.decrementMinute(event);
                break;

            case 2:
                if (direction === 1) this.incrementSecond(event);
                else this.decrementSecond(event);
                break;
        }

        this.updateInputfield();
    }

    clearTimePickerTimer() {
        if (this.timePickerTimer) {
            clearTimeout(this.timePickerTimer);
            this.timePickerTimer = null;
        }
    }

    decrementHour(event: any) {
        let newHour = ( this.currentHour ?? 0 ) - this.stepHour;
        let newPM = this.pm;
        if (this.hourFormat == '24')
            newHour = newHour < 0 ? 24 + newHour : newHour;
        else if (this.hourFormat == '12') {
            // If we were at noon/midnight, then switch
            if (this.currentHour === 12) {
                newPM = !this.pm;
            }
            newHour = newHour <= 0 ? 12 + newHour : newHour;
        }
        [ this.currentHour, this.currentMinute, this.currentSecond ] = this.constrainTime(newHour, this.currentMinute!, this.currentSecond!, newPM!);
        this.pm = newPM;
        event.preventDefault();
    }

    incrementMinute(event: any) {
        let newMinute = ( this.currentMinute ?? 0 ) + this.stepMinute;
        newMinute = newMinute > 59 ? newMinute - 60 : newMinute;
        [ this.currentHour, this.currentMinute, this.currentSecond ] = this.constrainTime(this.currentHour, newMinute, this.currentSecond!, this.pm!);
        event.preventDefault();
    }

    decrementMinute(event: any) {
        let newMinute = ( this.currentMinute ?? 0 ) - this.stepMinute;
        newMinute = newMinute < 0 ? 60 + newMinute : newMinute;
        [ this.currentHour, this.currentMinute, this.currentSecond ] = this.constrainTime(this.currentHour, newMinute, this.currentSecond, this.pm);
        event.preventDefault();
    }

    incrementSecond(event: any) {
        let newSecond = <any>this.currentSecond + this.stepSecond;
        newSecond = newSecond > 59 ? newSecond - 60 : newSecond;
        [ this.currentHour, this.currentMinute, this.currentSecond ] = this.constrainTime(this.currentHour, this.currentMinute, newSecond, this.pm);
        event.preventDefault();
    }

    decrementSecond(event: any) {
        let newSecond = <any>this.currentSecond - this.stepSecond;
        newSecond = newSecond < 0 ? 60 + newSecond : newSecond;
        [ this.currentHour, this.currentMinute, this.currentSecond ] = this.constrainTime(this.currentHour, this.currentMinute, newSecond, this.pm);
        event.preventDefault();
    }

    updateTime() {
    let value = this.value;
    if (this.isRangeSelection()) {
        value = this.getRangeSelectionValue(); 
    }
    if (this.isMultipleSelection()) {
        value = this.getMultipleSelectionValue();
    }
    value = this.getValueDate(value);

    if (this.hourFormat == '12') {
        value = this.set12HourFormat(value);
    } else {
        value.setHours(this.currentHour);
    }

    value.setMinutes(this.currentMinute);
    value.setSeconds(this.currentSecond);
    if (this.isRangeSelection()) {
        value = this.setRangeSelection(value);
    }

    if (this.isMultipleSelection()) {
        value = this.setMultipleSelection(value);
    }

    this.updateModel(value);
    this.onSelect.emit(value);
    this.updateInputfield();
}

getRangeSelectionValue() {
    return this.value[1] || this.value[0];
}

getMultipleSelectionValue() {
    return this.value[this.value.length - 1]; 
}

getValueDate(value) {
    return value ? new Date(value.getTime()) : new Date();
}

set12HourFormat(value) {
    if (this.currentHour === 12) {
        value.setHours(this.pm ? 12 : 0);
    } else {
        value.setHours(this.pm ? this.currentHour + 12 : this.currentHour);
    }
    return value;
}

setRangeSelection(value) {
    if (this.value[1]) {
        value = [this.value[0], value];
    } else {
        value = [value, null];
    }
    return value;
}

setMultipleSelection(value) {
    value = [...this.value.slice(0, -1), value];
    return value;
}


    toggleAMPM(event: any) {
        const newPM = !this.pm;
        [ this.currentHour, this.currentMinute, this.currentSecond ] = this.constrainTime(this.currentHour, this.currentMinute, this.currentSecond, newPM);
        this.pm = newPM;
        this.updateTime();
        event.preventDefault();
    }

    onUserInput(event: KeyboardEvent | any) {
        // IE 11 Workaround for input placeholder : https://github.com/primefaces/primeng/issues/2026
        if (!this.isKeydown) {
            return;
        }
        this.isKeydown = false;

        let val = (<HTMLInputElement>event.target).value;
        try {
            let value = this.parseValueFromString(val);
            if (this.isValidSelection(value)) {
                this.updateModel(value);
                this.updateUI();
            } else if (this.keepInvalid) {
                this.updateModel(value);
            }
        } catch (err) {
            //invalid date
            let value = this.keepInvalid ? val : null;
            this.updateModel(value);
        }

        this.filled = (val != null && val.length) as any;
        this.onInput.emit(event);
    }

    isValidSelection(value: any): boolean {
        if (this.isSingleSelection()) {
            return this.isSelectable(value.getDate(), value.getMonth(), value.getFullYear(), false);
        } 
		let isValid = value.every((v: any) => this.isSelectable(v.getDate(), v.getMonth(), v.getFullYear(), false));
		if (isValid && this.isRangeSelection()) {
			isValid = value.length === 1 || (value.length > 1 && value[1] >= value[0]);
		}
        return isValid;
    }

        parseValueFromString(text: string): Date | Date[] | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  let value: any;

  if (this.isSingleSelection()) {
    value = this.parseDateTime(text);
  } else if (this.isMultipleSelection()) {
    let tokens = text.split(this.multipleSeparator);
    value = [];
    for (let token of tokens) {
      let parsedDate = this.parseDateTime(token.trim());
      value.push(parsedDate);
    }
  } else if (this.isRangeSelection()) {
    let tokens = text.split(' ' + this.rangeSeparator + ' ');
    value = [];
    for (let token of tokens) {
      let parsedDate = this.parseDateTime(token.trim());
      value.push(parsedDate);
    }
  }

  return value;
}





    parseDateTime(text: any): Date {
        let date: Date;
        let parts: string[] = text.split(' ');

        if (this.timeOnly) {
            date = new Date();
            this.populateTime(date, parts[0], parts[1]);
        } else {
            const dateFormat = this.getDateFormat();
            if (this.showTime) {
                let ampm = this.hourFormat == '12' ? parts.pop() : null;
                let timeString = parts.pop();

                date = this.parseDate(parts.join(' '), dateFormat);
                this.populateTime(date, timeString, ampm);
            } else {
                date = this.parseDate(text, dateFormat);
            }
        }

        return date;
    }

    populateTime(value: any, timeString: any, ampm: any) {
        if (this.hourFormat == '12' && !ampm) {
            throw 'Invalid Time';
        }

        this.pm = ampm === 'PM' || ampm === 'pm';
        let time = this.parseTime(timeString);
        value.setHours(time.hour);
        value.setMinutes(time.minute);
        value.setSeconds(time.second);
    }

    isValidDate(date: any) {
        return ObjectUtils.isDate(date) && ObjectUtils.isNotEmpty(date);
    }

        updateUI() {
        let propValue = this.value;
        if (Array.isArray(propValue)) {
            propValue = this.getPropValueFromArray(propValue);
        }

        let val = this.getValueToUpdate(propValue);
        
        this.updateCurrentMonthAndYear(val);

        if (this.showTime || this.timeOnly) {
            this.updateCurrentTime(val);
        }
    }
    
    getPropValueFromArray(propValue) {
        return propValue.length === 2 ? propValue[1] : propValue[0];
    }
    
    getValueToUpdate(propValue) {
        return this.defaultDate && this.isValidDate(this.defaultDate) && !this.value
            ? this.defaultDate
            : propValue && this.isValidDate(propValue)
                ? propValue
                : new Date();
    }
    
    updateCurrentMonthAndYear(val) {
        this.currentMonth = val.getMonth();
        this.currentYear = val.getFullYear();
        this.createMonths(this.currentMonth, this.currentYear);
    }
    
    updateCurrentTime(val) {
        this.setCurrentHourPM(val.getHours());
        this.currentMinute = val.getMinutes();
        this.currentSecond = val.getSeconds();
    }


    showOverlay() {
        if (!this.overlayVisible) {
            this.updateUI();

            if (!this.touchUI) {
                this.preventFocus = true;
            }

            this.overlayVisible = true;
        }
    }

    hideOverlay() {
        this.inputfieldViewChild?.nativeElement.focus();
        this.overlayVisible = false;
        this.clearTimePickerTimer();

        if (this.touchUI) {
            this.disableModality();
        }

        this.cd.markForCheck();
    }

    toggle() {
        if (!this.inline) {
            if (!this.overlayVisible) {
                this.showOverlay();
                this.inputfieldViewChild?.nativeElement.focus();
            } else {
                this.hideOverlay();
            }
        }
    }

        onOverlayAnimationStart(event: AnimationEvent) {
        if (event.toState === 'visible' || event.toState === 'visibleTouchUI') {
            if (!this.inline) {
                this.overlay = event.element;
                this.overlay?.setAttribute(this.attributeSelector as string, '');
                this.appendOverlay();
                this.updateFocus();
                
                this.handleAutoZIndex();

                this.alignOverlay();
                this.onShow.emit(event);
            }
        } else if (event.toState === 'void') {
            this.onOverlayHide();
            this.onClose.emit(event);
        }
    }
    
    handleAutoZIndex() {
        if (this.autoZIndex) {
            if (this.touchUI) {
                ZIndexUtils.set('modal', this.overlay, this.baseZIndex || this.config.zIndex.modal);
            } else {
                ZIndexUtils.set('overlay', this.overlay, this.baseZIndex || this.config.zIndex.overlay);
            }
        }
    }


    onOverlayAnimationDone(event: AnimationEvent) {
        switch (event.toState) {
            case 'visible':
            case 'visibleTouchUI':
                if (!this.inline) {
                    this.bindDocumentClickListener();
                    this.bindDocumentResizeListener();
                    this.bindScrollListener();
                }
                break;

            case 'void':
                if (this.autoZIndex) {
                    ZIndexUtils.clear(event.element);
                }
                break;
        }
    }

    appendOverlay() {
        if (this.appendTo) {
            if (this.appendTo === 'body') this.document.body.appendChild(<HTMLElement>this.overlay);
            else DomHandler.appendChild(this.overlay, this.appendTo);
        }
    }

    restoreOverlayAppend() {
        if (this.overlay && this.appendTo) {
            this.el.nativeElement.appendChild(this.overlay);
        }
    }

        alignOverlay() {
        if (this.touchUI) {
            this.enableModality(this.overlay);
        } else {
            this.alignOverlayDesktop();            
        }
    }
    
    alignOverlayDesktop() {
        if (this.overlay) {
            if (this.appendTo) {
                this.setOverlayWidth();
                DomHandler.absolutePosition(this.overlay, this.inputfieldViewChild?.nativeElement);
            } else {
                DomHandler.relativePosition(this.overlay, this.inputfieldViewChild?.nativeElement);
            }
        }
    }
    
    setOverlayWidth() {
        if (this.view === 'date') {
            this.overlay.style.width = DomHandler.getOuterWidth(this.overlay) + 'px';
            this.overlay.style.minWidth = DomHandler.getOuterWidth(this.inputfieldViewChild?.nativeElement) + 'px';
        } else {
            this.overlay.style.width = DomHandler.getOuterWidth(this.inputfieldViewChild?.nativeElement) + 'px';
        }
    }


    enableModality(element: any) {
        if (!this.mask && this.touchUI) {
            this.mask = this.renderer.createElement('div');
            this.renderer.setStyle(this.mask, 'zIndex', String(parseInt(element.style.zIndex) - 1));
            let maskStyleClass = 'p-component-overlay p-datepicker-mask p-datepicker-mask-scrollblocker p-component-overlay p-component-overlay-enter';
            DomHandler.addMultipleClasses(this.mask, maskStyleClass);

            this.maskClickListener = this.renderer.listen(this.mask, 'click', (event: any) => {
                this.disableModality();
                this.overlayVisible = false;
            });
            this.renderer.appendChild(this.document.body, this.mask);
            DomHandler.blockBodyScroll();
        }
    }

    disableModality() {
        if (this.mask) {
            DomHandler.addClass(this.mask, 'p-component-overlay-leave');
            if (!this.animationEndListener) {
                this.animationEndListener = this.renderer.listen(this.mask, 'animationend', this.destroyMask.bind(this));
            }
        }
    }

    destroyMask() {
        if (!this.mask) {
            return;
        }
        this.renderer.removeChild(this.document.body, this.mask);
        let bodyChildren = this.document.body.children;
        let hasBlockerMasks!: boolean;
        for (let i = 0; i < bodyChildren.length; i++) {
            let bodyChild = bodyChildren[i];
            if (DomHandler.hasClass(bodyChild, 'p-datepicker-mask-scrollblocker')) {
                hasBlockerMasks = true;
                break;
            }
        }

        if (!hasBlockerMasks) {
            DomHandler.unblockBodyScroll();
        }

        this.unbindAnimationEndListener();
        this.unbindMaskClickListener();
        this.mask = null;
    }

    unbindMaskClickListener() {
        if (this.maskClickListener) {
            this.maskClickListener();
            this.maskClickListener = null;
        }
    }

    unbindAnimationEndListener() {
        if (this.animationEndListener && this.mask) {
            this.animationEndListener();
            this.animationEndListener = null;
        }
    }

    writeValue(value: any): void {
        this.value = value;
        if (this.value && typeof this.value === 'string') {
            try {
                this.value = this.parseValueFromString(this.value);
            } catch {
                if (this.keepInvalid) {
                    this.value = value;
                }
            }
        }

        this.updateInputfield();
        this.updateUI();
        this.cd.markForCheck();
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    setDisabledState(val: boolean): void {
        this.disabled = val;
        this.cd.markForCheck();
    }

    getDateFormat() {
        return this.dateFormat || this.getTranslation('dateFormat');
    }

    getFirstDateOfWeek() {
        return this._firstDayOfWeek || this.getTranslation(TranslationKeys.FIRST_DAY_OF_WEEK);
    }

    // Ported from jquery-ui datepicker formatDate
    formatDate(date: any, format: any) {
        if (!date) {
            return '';
        }
    
        let output = '';
        let literal = false;
    
        const context = { format, iFormat: 0 };
    
        for (context.iFormat = 0; context.iFormat < format.length; context.iFormat++) {
            const char = format.charAt(context.iFormat);
    
            if (literal) {
                if (char === "'" && !this.checkAhead(context, "'")) {
                    literal = false;
                } else {
                    output += char;
                }
            } else {
                output += this.processFormatChar(date, context, char);
                if (char === "'") {
                    literal = !this.checkAhead(context, "'");
                }
            }
        }
    
        return output;
    }
    
    checkAhead(context: any, match: string): boolean {
        const { format, iFormat } = context;
        const matches = iFormat + 1 < format.length && format.charAt(iFormat + 1) === match;
        if (matches) {
            context.iFormat++;
        }
        return matches;
    }
    
    formatNumeric(match: string, value: any, len: number, context: any): string {
        let num = '' + value;
        if (this.checkAhead(context, match)) {
            while (num.length < len) {
                num = '0' + num;
            }
        }
        return num;
    }
    
    formatText(match: string, value: any, shortNames: string[], longNames: string[], context: any): string {
        return this.checkAhead(context, match) ? longNames[value] : shortNames[value];
    }
    
    processFormatChar(date: any, context: any, char: string): string {
        switch (char) {
            case 'd':
                return this.formatNumeric('d', date.getDate(), 2, context);
            case 'D':
                return this.formatDayName(date, context);
            case 'o':
                return this.formatNumeric('o', this.getDayOfYear(date), 3, context);
            case 'm':
                return this.formatNumeric('m', date.getMonth() + 1, 2, context);
            case 'M':
                return this.formatMonthName(date, context);
            case 'y':
                return this.formatFullYear(date, context);
            case '@':
                return '' + date.getTime();
            case '!':
                return '' + (date.getTime() * 10000 + <number>this.ticksTo1970);
            case "'":
                return "'";
            default:
                return char;
        }
    }
    
    getDayOfYear(date: Date): number {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
        return Math.floor(diff / 86400000);
    }
    
    formatFullYear(date: Date, context: any): string {
        const year = date.getFullYear();
        return this.checkAhead(context, 'y') ? '' + year : (year % 100 < 10 ? '0' : '') + (year % 100);
    }
    
    formatDayName(date: Date, context: any): string {
        return this.formatText('D', date.getDay(), this.getTranslation(TranslationKeys.DAY_NAMES_SHORT), this.getTranslation(TranslationKeys.DAY_NAMES), context);
    }
    
    formatMonthName(date: Date, context: any): string {
        return this.formatText('M', date.getMonth(), this.getTranslation(TranslationKeys.MONTH_NAMES_SHORT), this.getTranslation(TranslationKeys.MONTH_NAMES), context);
    }
    

        formatTime(date: any) {
        if (!date) {
            return '';
        }

        let output = this.formatHours(date);
        output += ':';
        output += this.formatMinutes(date);
        
        if (this.showSeconds) {
            output += ':';
            output += this.formatSeconds(date);
        }

        if (this.hourFormat == '12') {
            output += this.formatAMPM(date);
        }

        return output;
    }
    
        formatHours(date) {
        let hours = date.getHours();
        
        if (this.hourFormat == '12') {
            hours = hours % 12;
            hours = hours ? hours : 12; 
            return hours < 10 ? '0' + hours : hours;
        } else {
            return hours < 10 ? '0' + hours : hours;
        }
    }

    
    formatMinutes(date) {
        let minutes = date.getMinutes();
        return minutes < 10 ? '0' + minutes : minutes;
    }
    
    formatSeconds(date) {
        let seconds = date.getSeconds();    
        return seconds < 10 ? '0' + seconds : seconds;
    }

    formatAMPM(date) {
        return date.getHours() > 11 ? ' PM' : ' AM';
    }


    parseTime(value: any) {

  const tokens = value.split(':');
  const validTokenLength = this.showSeconds ? 3 : 2;

  this.validateTokens(tokens, validTokenLength);

  const h = this.parseHour(tokens[0]);  
  const m = this.parseMinute(tokens[1]);
  const s = this.parseSecond(tokens[2]);

  return this.buildTimeObject(h, m, s);

}

validateTokens(tokens, validLength) {
  if (tokens.length !== validLength) {
    throw new Error('Invalid time'); 
  }
}

parseHour(hour) {
  const h = parseInt(hour, 10);

  if (isNaN(h)) {
    throw new Error('Invalid hour');
  }

  if (h > 23) {
    throw new Error('Invalid hour');    
  }

  if (this.hourFormat === '12' && h > 12) {
    throw new Error('Invalid hour');
  }

  return h;
}


parseMinute(minute) {
  const m = parseInt(minute, 10);
  
  if (isNaN(m) || m > 59) {
    throw new Error('Invalid minute');  
  }

  return m;
}

parseSecond(second) {
  if (!this.showSeconds) {
    return null;
  }

  const s = parseInt(second, 10);

  if (isNaN(s) || s > 59) {
    throw new Error('Invalid second');
  }

  return s;
}

buildTimeObject(hour, minute, second) {
  if (this.hourFormat === '12') {
    hour = this.adjustHourFor12Hour(hour);
  }

  return {
    hour,
    minute,
    second
  };
}

adjustHourFor12Hour(hour) {
  if (hour !== 12 && this.pm) {
    hour += 12;
  } else if (!this.pm && hour === 12) {
    hour -= 12;
  }

  return hour;
}



    // Ported from jquery-ui datepicker parseDate
    parseDate(value: any, format: any) {
        if (!format || !value) {
            throw new Error('Invalid arguments');
        }
    
        value = typeof value === 'object' ? value.toString() : value + '';
        if (value === '') {
            return null;
        }
    
        const shortYearCutoff = this.getShortYearCutoff();
        let context = this.initializeContext(format, value, shortYearCutoff);
    
        if (this.view === 'month') {
            context.day = 1;
        }
    
        while (context.iFormat < format.length) {
            this.parseDateCharacter(context);
        }
    
        if (context.iValue < value.length) {
            this.checkExtraCharacters(context);
        }
    
        context.year = this.resolveYear(context.year, shortYearCutoff);
    
        if (context.doy > -1) {
            this.resolveDayOfYear(context);
        }
    
        if (this.view === 'year') {
            context.month = context.month === -1 ? 1 : context.month;
            context.day = context.day === -1 ? 1 : context.day;
        }
    
        const date = this.adjustForDaylightSaving(new Date(context.year, context.month - 1, context.day));
        this.validateDate(date, context);
    
        return date;
    }
    
    initializeContext(format: any, value: any, shortYearCutoff: number) {
        return {
            format,
            value,
            iFormat: 0,
            iValue: 0,
            year: -1,
            month: -1,
            day: -1,
            doy: -1,
            literal: false,
            shortYearCutoff,
        };
    }
    
    checkExtraCharacters(context: any) {
        const extra = context.value.substr(context.iValue);
        if (!/^\s+/.test(extra)) {
            throw new Error('Extra/unparsed characters found in date: ' + extra);
        }
    }
    
    resolveYear(year: number, shortYearCutoff: number) {
        if (year === -1) {
            return new Date().getFullYear();
        } else if (year < 100) {
            return year + (new Date().getFullYear() - (new Date().getFullYear() % 100)) + (year <= shortYearCutoff ? 0 : -100);
        }
        return year;
    }
    
    validateDate(date: Date, context: any) {
        const bc1 = date.getFullYear() !== context.year || date.getMonth() + 1 !== context.month || date.getDate() !== context.day;
        if (bc1) {
            throw new Error('Invalid date');
        }
    }
    
    
    getShortYearCutoff(): number {
        return typeof this.shortYearCutoff !== 'string' 
            ? this.shortYearCutoff 
            : (new Date().getFullYear() % 100) + parseInt(this.shortYearCutoff, 10);
    }
    
    parseDateCharacter(context: any) {
        const char = context.format.charAt(context.iFormat);
    
        if (context.literal) {
            this.handleLiteralCharacter(context, char);
        } else {
            this.handleFormatCharacter(context, char);
        }
    
        context.iFormat++;
    }
    
    handleLiteralCharacter(context: any, char: string) {
        if (char === "'" && !this.lookAhead(context, "'")) {
            context.literal = false;
        } else {
            this.checkLiteral(context);
        }
    }
    
    handleFormatCharacter(context: any, char: string) {
        const formatHandlers: { [key: string]: (context: any) => void } = {
            'd': this.handleDay,
            'D': this.handleDayName,
            'o': this.handleDayOfYear,
            'm': this.handleMonth,
            'M': this.handleMonthName,
            'y': this.handleYear,
            '@': this.handleUnixTime,
            '!': this.handleTicks,
            "'": this.handleSingleQuote,
        };
    
        if (formatHandlers[char]) {
            formatHandlers[char].call(this, context);
        } else {
            this.checkLiteral(context);
        }
    }
    
    handleDay(context: any) {
        context.day = this.getNumber(context, 'd');
    }
    
    handleDayName(context: any) {
        this.getName(context, 'D', this.getTranslation(TranslationKeys.DAY_NAMES_SHORT), this.getTranslation(TranslationKeys.DAY_NAMES));
    }
    
    handleDayOfYear(context: any) {
        context.doy = this.getNumber(context, 'o');
    }
    
    handleMonth(context: any) {
        context.month = this.getNumber(context, 'm');
    }
    
    handleMonthName(context: any) {
        this.getName(context, 'M', this.getTranslation(TranslationKeys.MONTH_NAMES_SHORT), this.getTranslation(TranslationKeys.MONTH_NAMES));
    }
    
    handleYear(context: any) {
        context.year = this.getNumber(context, 'y');
    }
    
    handleUnixTime(context: any) {
        context.date = new Date(this.getNumber(context, '@'));
        this.setDateFieldsFromDate(context);
    }
    
    handleTicks(context: any) {
        context.date = new Date((this.getNumber(context, '!') - <number>this.ticksTo1970) / 10000);
        this.setDateFieldsFromDate(context);
    }
    
    handleSingleQuote(context: any) {
        if (this.lookAhead(context, "'")) {
            this.checkLiteral(context);
        } else {
            context.literal = true;
        }
    }
    
    parseDayName(context: any) {
        this.getName(context, 'D', this.getTranslation(TranslationKeys.DAY_NAMES_SHORT), this.getTranslation(TranslationKeys.DAY_NAMES));
    }
    
    parseMonthName(context: any) {
        this.getName(context, 'M', this.getTranslation(TranslationKeys.MONTH_NAMES_SHORT), this.getTranslation(TranslationKeys.MONTH_NAMES));
    }
    
    setDateFromUnixTime(context: any) {
        context.date = new Date(this.getNumber(context, '@'));
        this.setDateFieldsFromDate(context);
    }
    
    setDateFromTicks(context: any) {
        context.date = new Date((this.getNumber(context, '!') - <number>this.ticksTo1970) / 10000);
        this.setDateFieldsFromDate(context);
    }
    
    
    lookAhead(context: any, match: string): boolean {
        const matches = context.iFormat + 1 < context.format.length && context.format.charAt(context.iFormat + 1) === match;
        if (matches) {
            context.iFormat++;
        }
        return matches;
    }
    
    getNumber(context: any, match: string): number {
        const isDoubled = this.lookAhead(context, match);
        const size = this.getNumberSize(match, isDoubled);
        const digits = new RegExp('^\\d{' + size.minSize + ',' + size.maxSize + '}');
        const num = context.value.substring(context.iValue).match(digits);
    
        if (!num) {
            throw new Error(`Missing number at position ${context.iValue}`);
        }
    
        context.iValue += num[0].length;
        return parseInt(num[0], 10);
    }
    
    getNumberSize(match: string, isDoubled: boolean): any {
        switch (match) {
            case '@':
                return { minSize: 14, maxSize: 14 };
            case '!':
                return { minSize: 20, maxSize: 20 };
            case 'y':
                return { minSize: isDoubled ? 4 : 1, maxSize: isDoubled ? 4 : 2 };
            case 'o':
                return { minSize: 1, maxSize: 3 };
            default:
                return { minSize: 1, maxSize: 2 };
        }
    }
    
    getName(context: any, match: string, shortNames: string[], longNames: string[]): number {
        const arr = this.lookAhead(context, match) ? longNames : shortNames;
        const names = this.sortNamesByLength(arr);
    
        for (const name of names) {
            if (context.value.substr(context.iValue, name.length).toLowerCase() === name.toLowerCase()) {
                context.iValue += name.length;
                return name.index + 1;
            }
        }
    
        throw new Error(`Unknown name at position ${context.iValue}`);
    }
    
    sortNamesByLength(names: string[]): any[] {
        return names.map((name, index) => ({ name, index }))
            .sort((a, b) => b.name.length - a.name.length);
    }
    
    checkLiteral(context: any) {
        if (context.value.charAt(context.iValue) !== context.format.charAt(context.iFormat)) {
            throw new Error(`Unexpected literal at position ${context.iValue}`);
        }
        context.iValue++;
    }
    
    
    resolveDayOfYear(context: any) {
        context.month = 1;
        context.day = context.doy;
    
        while (true) {
            const dim = this.getDaysCountInMonth(context.year, context.month - 1);
            if (context.day <= dim) {
                break;
            }
            context.month++;
            context.day -= dim;
        }
    }
    
    setDateFieldsFromDate(context: any) {
        context.year = context.date.getFullYear();
        context.month = context.date.getMonth() + 1;
        context.day = context.date.getDate();
    }
    
    adjustForDaylightSaving(date: Date): Date {
        return this.daylightSavingAdjust(date);
    }
       
    daylightSavingAdjust(date: any) {
        if (!date) {
            return null;
        }

        date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);

        return date;
    }

    updateFilledState() {
        this.filled = (this.inputFieldValue && this.inputFieldValue != '') as boolean;
    }

    onTodayButtonClick(event: any) {
        const date: Date = new Date();
        const dateMeta = { day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), otherMonth: date.getMonth() !== this.currentMonth || date.getFullYear() !== this.currentYear, today: true, selectable: true };

        this.createMonths(date.getMonth(), date.getFullYear());
        this.onDateSelect(event, dateMeta);
        this.onTodayClick.emit(date);
    }

    onClearButtonClick(event: any) {
  this.updateModel(null);
  
  this.updateInputfield();

  this.hideOverlay();

  this.onClearClick.emit(event);
}


        createResponsiveStyle() {
  if (this.numberOfMonths > 1 && this.responsiveOptions) {
    
    let innerHTML = '';
    if (this.responsiveOptions) {
      
      let responsiveOptions = this.responsiveOptions.filter(o => !!(o.breakpoint && o.numMonths));

      responsiveOptions.forEach(option => {
        let {breakpoint, numMonths} = option;
        
        let styles = `
          .p-datepicker[${this.attributeSelector}] .p-datepicker-group:nth-child(${numMonths}) .p-datepicker-next {
            display: inline-flex !important; 
          }
        `;

        for (let j = numMonths; j < this.numberOfMonths; j++) {
          styles += `
            .p-datepicker[${this.attributeSelector}] .p-datepicker-group:nth-child(${j + 1}) {
              display: none !important;
            }
          `;
        }

        innerHTML += `
          @media screen and (max-width: ${breakpoint}) {
            ${styles}
          }
        `;
      });
      
      if (!this.responsiveStyleElement) {
        this.responsiveStyleElement = this.renderer.createElement('style');
        this.renderer.appendChild(this.document.body, this.responsiveStyleElement);  
      }
      (<HTMLStyleElement>this.responsiveStyleElement).innerHTML = innerHTML;
    }
  }
}




    destroyResponsiveStyleElement() {
        if (this.responsiveStyleElement) {
            this.responsiveStyleElement.remove();
            this.responsiveStyleElement = null;
        }
    }

    bindDocumentClickListener() {
        if (!this.documentClickListener) {
            this.zone.runOutsideAngular(() => {
                const documentTarget: any = this.el ? this.el.nativeElement.ownerDocument : this.document;

                this.documentClickListener = this.renderer.listen(documentTarget, 'mousedown', (event) => {
                    if (this.isOutsideClicked(event) && this.overlayVisible) {
                        this.zone.run(() => {
                            this.hideOverlay();
                            this.onClickOutside.emit(event);

                            this.cd.markForCheck();
                        });
                    }
                });
            });
        }
    }

    unbindDocumentClickListener() {
        if (this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }

    bindDocumentResizeListener() {
        if (!this.documentResizeListener && !this.touchUI) {
            this.documentResizeListener = this.renderer.listen(this.window, 'resize', this.onWindowResize.bind(this));
        }
    }

    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            this.documentResizeListener();
            this.documentResizeListener = null;
        }
    }

    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(this.containerViewChild?.nativeElement, () => {
                if (this.overlayVisible) {
                    this.hideOverlay();
                }
            });
        }

        this.scrollHandler.bindScrollListener();
    }

    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
        }
    }

    isOutsideClicked(event: Event) {
        return !(this.el.nativeElement.isSameNode(event.target) || this.isNavIconClicked(event) || this.el.nativeElement.contains(event.target) || (this.overlay && this.overlay.contains(<Node>event.target)));
    }

    isNavIconClicked(event: Event) {
        return (
            DomHandler.hasClass(event.target, 'p-datepicker-prev') || DomHandler.hasClass(event.target, 'p-datepicker-prev-icon') || DomHandler.hasClass(event.target, 'p-datepicker-next') || DomHandler.hasClass(event.target, 'p-datepicker-next-icon')
        );
    }

    onWindowResize() {
        if (this.overlayVisible && !DomHandler.isTouchDevice()) {
            this.hideOverlay();
        }
    }

    onOverlayHide() {
        this.currentView = this.view;

        if (this.mask) {
            this.destroyMask();
        }

        this.unbindDocumentClickListener();
        this.unbindDocumentResizeListener();
        this.unbindScrollListener();
        this.overlay = null;
    }

    ngOnDestroy() {
        if (this.scrollHandler) {
            this.scrollHandler.destroy();
            this.scrollHandler = null;
        }

        if (this.translationSubscription) {
            this.translationSubscription.unsubscribe();
        }

        if (this.overlay && this.autoZIndex) {
            ZIndexUtils.clear(this.overlay);
        }

        this.destroyResponsiveStyleElement();
        this.clearTimePickerTimer();
        this.restoreOverlayAppend();
        this.onOverlayHide();
    }
}

@NgModule({
    imports: [CommonModule, ButtonModule, SharedModule, RippleModule, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, TimesIcon, CalendarIcon],
    exports: [Calendar, ButtonModule, SharedModule],
    declarations: [Calendar]
})
export class CalendarModule {}
