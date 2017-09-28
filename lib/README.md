
## doc

### 字段的源信息
- name              名称
- type              类型
- default           默认值
- description       描述
- required          是否必须
- in                字段的位置。可为：'query', 'header', 'path', 'cookie'.

<!-- 是否添加，暂定 -->
- deprecated        是否废弃
- allowEmptyValue   是否允许为空

> String 类型数据

额外的源信息
- pattern           匹配规则
- minLength         最小的长度
- maxLength         最大的长度
- enum              枚举值

> Number 类型数据

额外的源信息
- minimum           number      最小值
- maximum           number      最大值
- exclusiveMinimum  boolean     Value must be > minimum
- exclusiveMaximum  boolean     Value must be < maximum
- multipleOf        number      是否是某个数的倍数


> Array 类型数据
额外的源信息
- minItems      number  数组的最小长度
- maxItems      number  数组的最大长度
- uniqueItems   boolean 数据的值是否唯一

### 请求的源信息
- consumes  请求返回的数据类型
    - application/x-www-form-urlencoded
    - multipart/form-data
    - application/json
    - application/x-yaml

