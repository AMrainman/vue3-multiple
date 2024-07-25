module.exports = {
  root: false, // 禁用持续查找（root）
  env: {
    node: true, //Node.js全局变量和Node.js范围。
    es6: true, // 启用ES6的功能。
    es2021: true, // 添加所有 ECMAScript 2021 全局变量并自动将 ecmaVersion 解析器选项设置为 12
    browser: true //启用浏览器全局变量。
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module', // 代模块类型，默认为script，我们设置为module
    ecmaVersion: 'latest' // 支持的es版本 - 9
    // ecmaFeatures: { // 使用jsx语法
    //     jsx: true
    // }
  },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    './.eslintrc-auto-import.json'
  ],

  plugins: ['@typescript-eslint', 'vue', 'prettier'], // 把 Prettier 推荐的格式问题的配置以 ESLint rules 的方式写入
  settings: {},
  globals: {
    dayjs: false,
    window: false,
    module: false,
    require: false,
    console: false,
    document: false,
    __dirname: false
  },
  // http://t.zoukankan.com/yanglang-p-13095515.html
  rules: {
    // 屏蔽错误
    'func-call-spacing': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // allow debugger during development
    // "no-console": process.env.NODE_ENV === "production" ? 2 : 1,
    // "no-debugger": process.env.NODE_ENV === "production" ? 2 : 1,

    'eol-last': 'off', // 文件以单一的换行符结束
    // 禁止出现未使用过的变量
    'no-unused-vars': 'off', // ‘off’ - error  定义未使用
    // 缩进使用 4 个空格，并且 switch 语句中的 Case 需要缩进、https://eslint.org/docs/rules/indent
    // 'indent': ['error', 4, {
    // 	'SwitchCase': 2,
    // 	"VariableDeclarator": "first",
    // 	'flatTernaryExpressions': true
    // }],
    indent: 'off',
    // 强制执行最大行长度
    'max-len': ['error', { code: 180 }],

    // 设置每行最大属性数 'off', 强制每行属性的最大数量
    'vue/max-attributes-per-line': [
      'warn',
      {
        singleline: {
          // 标签为单行时，每行最大属性数值为 10，默认值为 1
          max: 1
        },
        multiline: {
          // 标签为多行时，每行最大属性数字为 1，默认值为 1
          max: 1
          //     allowFirstLine: false // 不允许属性与该标记名称位于同一行，默认值为 false
        }
      }
    ],

    'vue/custom-event-name-casing': 'off', // 为自定义事件名称强制使用特定大小写
    'vue/attributes-order': 'off', // 强制执行属性顺序
    'vue/one-component-per-file': 'off', // 强制每个组件都应该在自己的文件中
    'vue/html-closing-bracket-newline': 'off', // 在标签的右括号之前要求或禁止换行
    'vue/multiline-html-element-content-newline': 'off', // 在多行元素的内容之前和之后需要换行符
    'vue/singleline-html-element-content-newline': 'off', // 在单行元素的内容之前和之后需要换行符
    'vue/attribute-hyphenation': 'off', // 对模板中的自定义组件强制执行属性命名样式
    'vue/require-default-prop': 'off', // 需要 props 的默认值
    'vue/html-indent': ['error', 2], // 在<template>中强制一致缩进
    'vue/html-self-closing': 'off', // 执行自闭合的风格
    'vue/multi-word-component-names': 'off', // 关闭组件命名规则 ---  根据官方风格指南，除了根组件（App.vue）外，自定义组件名称应该由多单词组成，
    // 防止和html标签冲突。而最新的vue-cli创建的项目使用了最新的vue/cli-plugin-eslint插件，在vue/cli-plugin-eslint v7.20.0版本之后就引用了vue/multi-word-component-names规则，所以在编译的时候判定此次错误

    'no-var': 'error',
    // 只有一个参数时，箭头函数体可以省略圆括号、https://eslint.org/docs/rules/arrow-parens
    'arrow-parens': 'off', // 0, 'off'
    // 函数定义的时候不允许出现重复的参数
    'no-dupe-args': 2,
    // 函数的箭头之前或之后有空格
    'arrow-spacing': 2,
    // "prettier/prettier": "error",
    // 对象字面量中冒号的后面必须有空格，前面不允许有空格
    'key-spacing': [
      2,
      {
        afterColon: true,
        beforeColon: false
      }
    ],
    // 关键字前后必须存在空格
    'keyword-spacing': [
      2,
      {
        before: true,
        after: true
      }
    ],
    // allow async-await
    'generator-star-spacing': 0,
    // 必须使用 === 或 !==，禁止使用 == 或 !=，与 null 比较时除外
    eqeqeq: [
      2,
      'always',
      {
        null: 'ignore'
      }
    ],
    'space-before-function-paren': [0, 'always'],
    // 构造函数首字母大写
    'new-cap': [
      2,
      {
        newIsCap: true,
        capIsNew: false
      }
    ],
    // 在写逗号时，逗号前面不需要加空格，而逗号后面需要添加空格
    'comma-spacing': [
      2,
      {
        before: false,
        after: true
      }
    ],
    // 要求注释周围有空行 = 放开后注释前面会空一行
    // "lines-around-comment": ["error", { "beforeBlockComment": true }],
    // 代码末尾不需要分号
    semi: [2, 'never'],
    // 为块强制实施一致的大括号样式
    'brace-style': 1,
    // es6中``操作符优先，替代+操作符
    'prefer-template': 1,
    // 限制函数的最大参数个数,
    'max-params': [2, 6],
    // 禁止 for 循环出现方向错误的循环，比如 for (i = 0; i < 10; i--)
    'for-direction': 'error',
    // 在注释中的“//”或“/*”后强制使用一致的间距
    'spaced-comment': ['error', 'always'],
    // 对多行注释强制实施特定样式 -- 多行注释 必须使用/*
    // "multiline-comment-style": ["error", "bare-block"],
    // 强制实施一致的逗号样式
    'comma-style': [2, 'last'],
    // 在定义对象或数组时，最后一项不能加逗号
    'comma-dangle': [2, 'never'],
    'space-before-blocks': [1, 'always'],
    // 该条规则主要用于定义数组字面量定义数组时，前后是否加空格，接受两个可选配置，always 和never ,如果设置为always 那么就应该在在写数组是前后都留空格 - 数组前后空格
    'array-bracket-spacing': [2, 'never'],
    'object-curly-spacing': [2, 'always'], // 大括号内是否允许不必要的空格 - 对象前后空格
    // getter 必须有返回值，并且禁止返回空，比如 return;
    'getter-return': [
      'error',
      {
        allowImplicit: false
      }
    ],

    // 'vue/html-closing-bracket-newline': 'on',

    // typescript
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-non-null-assertion': 0,
    // 关闭方法必须要返回类型
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,

    // any, 扩展运算符中可以运用any
    '@typescript-eslint/no-explicit-any': ['off'],
    // 跟prettier冲突
    // "space-before-function-paren": [2, {
    //     "anonymous": "never",
    //     "named": "never",
    //     "asyncArrow": "always"
    // }],

    // "@typescript-eslint/naming-convention": [
    //     "error",
    //     {"selector": "default", "format": ["camelCase"]},
    //     {"selector": "variableLike", "format": ["camelCase", "PascalCase"] },
    //     {"selector": "enumMember", "format": ["UPPER_CASE"] },
    //     {"selector": "enum", "format": ["UPPER_CASE"], "prefix": ["E"] },
    //     {"selector": "typeParameter","format": ["PascalCase"],"prefix": ["T"]},
    //     {"selector": "interface","format": ["PascalCase"],"prefix": ["I"]}
    // ],
    'vue/first-attribute-linebreak': [
      'error',
      {
        singleline: 'ignore',
        multiline: 'ignore'
      }
    ]
  }
}
