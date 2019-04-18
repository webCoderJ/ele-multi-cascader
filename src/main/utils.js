export function deepClone(source) {
    if (!source && typeof source !== "object") {
        throw new Error("error arguments", "shallowClone");
    }
    const targetObj = source.constructor === Array ? [] : {};
    Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === "object") {
            targetObj[keys] = source[keys].constructor === Array ? [] : {};
            targetObj[keys] = deepClone(source[keys]);
        } else {
            targetObj[keys] = source[keys];
        }
    });
    return targetObj;
}

export function hasArrayChild(obj, childrenKey) {
    return obj[childrenKey] && Array.isArray(obj[childrenKey]);
}

let id = 0;

export function getId() {
    return ++id;
}

export function fireEvent(element, event) {
    if (document.createEventObject) {
        // IE浏览器支持fireEvent方法
        var evt = document.createEventObject();
        return element.fireEvent("on" + event, evt);
    } else {
        // 其他标准浏览器使用dispatchEvent方法
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true);
        return !element.dispatchEvent(evt);
    }
}

export function isPromise(obj) {
    return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
}

// 所有选项
export const props = {
    value: {
        type: Array,
        default() {
            return [];
        }
    },
    placeholder: {
        type: String,
        default: "请选择"
    },
    disabled: {
        type: Boolean,
        default: false
    },
    options: {
        type: Array,
        default() {
            return [];
        }
    },
    size: {
        type: String,
        default: ""
    },
    selectChildren: {
        type: Boolean,
        default: false
    },
    noDataText: {
        type: String,
        default: "无数据"
    },
    collapseTags: {
        type: Boolean,
        default: false
    },
    separator: {
        type: String,
        default: "/"
    },
    showAllLevels: {
        type: Boolean,
        default: false
    },
    outputLevelValue: {
        type: Boolean,
        default: false
    },
    // 显示加载指示器
    showLoadingIndicator: {
        type: Boolean,
        default: true
    },
    // 允许加载子项
    allowLoadChildren: {
        type: Boolean,
        default: false
    },
    // 加载方法
    loadChildrenMethod: {
        type: Function,
        default: null,
        return: Promise
    },
    // key
    labelKey: {
        type: String,
        default: "label"
    },
    valueKey: {
        type: String,
        default: "value"
    },
    childrenKey: {
        type: String,
        default: "children"
    },
    popperClass: {
        type: String,
        default: ""
    },
    clearable: {
        type: Boolean,
        default: false
    },
    panelWidth: {
        type: [Number, String],
        default: 160
    }
};
