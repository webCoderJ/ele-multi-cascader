export const options = [
    { title: "默认", id: -1, sub: null, value: -1, isLeaf: true },
    {
        title: "电信",
        sub: [
            {
                title: "华东电信",
                sub: [
                    { title: "安徽电信-1-2-3-4", id: 51, sub: null, value: 51 },
                    { title: "福建电信", id: 52, sub: null, value: 52 },
                    { title: "江苏电信", id: 53, sub: null, value: 53 }
                ],
                id: 11,
                value: 11,
                // disabled: true
            },
            {
                title: "华南电信",
                sub: [
                    { title: "广东电信", id: 58, sub: null, value: 58 },
                    { title: "广西电信", id: 59, sub: null, value: 59 },
                ],
                id: 12,
                value: 12,
                // disabled: true
            },
        ],
        id: 1,
        value: 1
    },
    {
        title: "联通",
        sub: [
            {
                title: "华东联通",
                sub: [
                    { title: "安徽联通", id: 91, sub: null, value: 91 },
                    { title: "福建联通", id: 92, sub: null, value: 92 },
                    { title: "江苏联通", id: 93, sub: null, value: 93 }
                ],
                id: 21,
                value: 21,
                disabled: true
            },
            {
                title: "华南联通",
                sub: [
                    { title: "广东联通", id: 98, sub: null, value: 98 },
                    { title: "广西联通", id: 99, sub: null, value: 99 },
                    { title: "海南联通", id: 100, sub: null, value: 100 }
                ],
                id: 22,
                value: 22,
                disabled: true
            }
        ],
        id: 2,
        value: 2,
        disabled: true
    },
    {
        title: "移动",
        sub: [
            {
                title: "华东移动",
                sub: [
                    { title: "安徽移动", id: 131, sub: null, value: 131 },
                ],
                id: 31,
                value: 31,
                disabled: true
            },
            {
                title: "华南移动",
                sub: [
                    { title: "广东移动", id: 138, sub: null, value: 138 },
                    { title: "广西移动", id: 139, sub: null, value: 139 },
                    { title: "海南移动", id: 140, sub: null, value: 140 }
                ],
                id: 32,
                value: 32,
                disabled: true
            },
        ],
        id: 3,
        value: 3,
        disabled: true
    },
    { title: "教育网", id: 6, sub: null, value: 6 },
    { title: "电信通", id: 7, sub: null, value: 7 }
];
