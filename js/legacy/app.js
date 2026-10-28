/* Legacy Fan Quest tracker (fandoms, school, Mochi). Moved out of index.html. */
const SCHED_DEFAULT=[{"s":"2026-08-31T09:00","e":"2026-08-31T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-08-31T14:00","e":"2026-08-31T17:00","m":"RSE 4501","k":"Workshop","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-09-01T09:00","e":"2026-09-01T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-09-01T16:00","e":"2026-09-01T18:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"Wee Liang Boon"},{"s":"2026-09-02T09:00","e":"2026-09-02T11:00","m":"RSE 3703","k":"Lectorial","l":"E6-03-15-SR342","w":"Wee Liang Boon"},{"s":"2026-09-03T09:00","e":"2026-09-03T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-09-03T13:00","e":"2026-09-03T17:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-09-07T09:00","e":"2026-09-07T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-09-07T14:00","e":"2026-09-07T17:00","m":"RSE 4501","k":"Workshop","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-09-08T09:00","e":"2026-09-08T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-09-08T16:00","e":"2026-09-08T18:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"Wee Liang Boon"},{"s":"2026-09-09T09:00","e":"2026-09-09T11:00","m":"RSE 3703","k":"Lectorial","l":"E6-03-15-SR342","w":"Wee Liang Boon"},{"s":"2026-09-10T09:00","e":"2026-09-10T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-09-10T13:00","e":"2026-09-10T17:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-09-14T09:00","e":"2026-09-14T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-09-14T14:00","e":"2026-09-14T17:00","m":"RSE 4501","k":"Workshop","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-09-15T09:00","e":"2026-09-15T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-09-15T16:00","e":"2026-09-15T18:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"Wee Liang Boon"},{"s":"2026-09-16T09:00","e":"2026-09-16T11:00","m":"RSE 3703","k":"Lectorial","l":"E6-03-15-SR342","w":"Wee Liang Boon"},{"s":"2026-09-17T09:00","e":"2026-09-17T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-09-17T13:00","e":"2026-09-17T17:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-09-21T09:00","e":"2026-09-21T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-09-21T14:00","e":"2026-09-21T17:00","m":"RSE 4501","k":"Workshop","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-09-22T09:00","e":"2026-09-22T12:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-09-22T16:00","e":"2026-09-22T18:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"Wee Liang Boon"},{"s":"2026-09-23T09:00","e":"2026-09-23T11:00","m":"RSE 3703","k":"Lectorial","l":"E6-03-15-SR342","w":"Wee Liang Boon"},{"s":"2026-09-24T09:00","e":"2026-09-24T12:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-09-24T13:00","e":"2026-09-24T17:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-09-28T09:00","e":"2026-09-28T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-09-28T14:00","e":"2026-09-28T17:00","m":"RSE 4501","k":"Workshop","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-09-29T09:00","e":"2026-09-29T12:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-09-29T16:00","e":"2026-09-29T18:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"Wee Liang Boon"},{"s":"2026-09-30T09:00","e":"2026-09-30T11:00","m":"RSE 3703","k":"Lectorial","l":"E6-03-15-SR342","w":"Wee Liang Boon"},{"s":"2026-10-01T09:00","e":"2026-10-01T12:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-10-02T14:00","e":"2026-10-02T18:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-10-05T09:00","e":"2026-10-05T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-10-05T16:00","e":"2026-10-05T18:00","m":"RSE 4501","k":"Quiz","l":"E6-2M-12-SR323","w":"Wee Liang Boon"},{"s":"2026-10-06T16:00","e":"2026-10-06T18:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"Wee Liang Boon"},{"s":"2026-10-07T09:00","e":"2026-10-07T11:00","m":"RSE 3703","k":"Quiz","l":"E6-2M-12-SR323","w":"Wee Liang Boon"},{"s":"2026-10-08T13:00","e":"2026-10-08T17:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-10-19T09:00","e":"2026-10-19T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-10-19T11:00","e":"2026-10-19T13:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"How Voon Ee"},{"s":"2026-10-19T14:00","e":"2026-10-19T17:00","m":"RSE 4501","k":"Workshop","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-10-20T09:00","e":"2026-10-20T12:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-10-20T13:00","e":"2026-10-20T16:00","m":"RSE 4804","k":"Quiz","l":"E6-2M-12-SR323","w":"Yip Yew Seng"},{"s":"2026-10-21T09:00","e":"2026-10-21T11:00","m":"RSE 3703","k":"Lectorial","l":"W1-06-02-SR01","w":"How Voon Ee"},{"s":"2026-10-22T13:00","e":"2026-10-22T17:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-10-26T09:00","e":"2026-10-26T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-10-26T11:00","e":"2026-10-26T13:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"How Voon Ee"},{"s":"2026-10-26T14:00","e":"2026-10-26T17:00","m":"RSE 4501","k":"Workshop","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-10-28T09:00","e":"2026-10-28T11:00","m":"RSE 3703","k":"Lectorial","l":"E6-03-15-SR342","w":"How Voon Ee"},{"s":"2026-10-29T09:00","e":"2026-10-29T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-10-29T13:00","e":"2026-10-29T17:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-11-02T09:00","e":"2026-11-02T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-11-02T11:00","e":"2026-11-02T13:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"How Voon Ee"},{"s":"2026-11-02T14:00","e":"2026-11-02T17:00","m":"RSE 4501","k":"Workshop","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-11-03T09:00","e":"2026-11-03T12:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-11-03T14:00","e":"2026-11-03T18:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-11-04T09:00","e":"2026-11-04T11:00","m":"RSE 3703","k":"Lectorial","l":"E6-03-15-SR342","w":"How Voon Ee"},{"s":"2026-11-05T09:00","e":"2026-11-05T12:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-11-05T16:00","e":"2026-11-05T18:00","m":"RSE 3703","k":"Quiz","l":"E6-2M-12-SR323","w":"How Voon Ee"},{"s":"2026-11-06T09:00","e":"2026-11-06T11:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"How Voon Ee"},{"s":"2026-11-10T09:00","e":"2026-11-10T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-11-10T11:00","e":"2026-11-10T13:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-11-10T14:00","e":"2026-11-10T17:00","m":"RSE 4501","k":"Workshop","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-11-11T09:00","e":"2026-11-11T11:00","m":"RSE 3703","k":"Lectorial","l":"E6-03-15-SR342","w":"How Voon Ee"},{"s":"2026-11-12T09:00","e":"2026-11-12T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-11-12T13:00","e":"2026-11-12T17:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-11-16T09:00","e":"2026-11-16T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-11-16T11:00","e":"2026-11-16T13:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"How Voon Ee"},{"s":"2026-11-16T14:00","e":"2026-11-16T17:00","m":"RSE 4501","k":"Workshop","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-11-17T09:00","e":"2026-11-17T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-11-18T09:00","e":"2026-11-18T11:00","m":"RSE 3703","k":"Lectorial","l":"E6-03-15-SR342","w":"How Voon Ee"},{"s":"2026-11-19T09:00","e":"2026-11-19T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-11-19T13:00","e":"2026-11-19T17:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"},{"s":"2026-11-23T09:00","e":"2026-11-23T11:00","m":"RSE 4501","k":"Lecture","l":"E6-2M-02-SR319","w":"Wee Liang Boon"},{"s":"2026-11-23T11:00","e":"2026-11-23T13:00","m":"RSE 3703","k":"Lecture","l":"Online","w":"How Voon Ee"},{"s":"2026-11-23T13:00","e":"2026-11-23T15:00","m":"RSE 3703","k":"Quiz","l":"E6-2M-12-SR323","w":"How Voon Ee"},{"s":"2026-11-24T09:00","e":"2026-11-24T11:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-11-24T13:00","e":"2026-11-24T15:00","m":"RSE 4501","k":"Quiz","l":"E6-2M-14-SR325","w":"Wee Liang Boon"},{"s":"2026-11-25T09:00","e":"2026-11-25T11:00","m":"RSE 3703","k":"Lectorial","l":"E6-03-15-SR342","w":"How Voon Ee"},{"s":"2026-11-26T09:00","e":"2026-11-26T12:00","m":"RSE 4804","k":"Lectorial","l":"E6-2M-02-SR319","w":"Yip Yew Seng"},{"s":"2026-11-26T13:00","e":"2026-11-26T16:00","m":"RSE 4804","k":"Quiz","l":"E6-03-11-SR338","w":"Yip Yew Seng"},{"s":"2026-11-27T14:00","e":"2026-11-27T18:00","m":"RSE 4207","k":"Lectorial","l":"E6-2M-02-SR319","w":"Winkler Stefan"}];const MOD_NAMES={"RSE 3703": "Control Systems", "RSE 4207": "Artificial Intelligence", "RSE 4501": "Navigation", "RSE 4804": "System Realization & Deployment"};
const CARD_CATS=[
 {id:'l26',name:'2026 限定卡',sub:'5★ limited',stars:5,cards:[['浴冕歌','12.31–1.21'],['晴昼当归','2.10–2.27'],['沉冥相遥','3.28–4.10'],['沉冥幽眷','3.28–4.10'],['蔓生本能','4.30–5.15'],['万里皆与你','6.8–6.14'],['触而可及','6.17–7.2'],['夏意涌向','8.5–8.14'],['盛宵尽夺','9.22–10.10']]},
 {id:'l25',name:'2025 限定卡',sub:'5★ limited',stars:5,cards:[['触痛讯号','1.22–2.8'],['附骨之痕','2.10–2.27'],['寂路同赴','3.28–4.11','复刻 26 2.2–2.9'],['寂路不归','3.28–4.11','复刻 26 2.2–2.9'],['浮花以栽','4.30–5.18'],['无可逃逸夜','6.8–6.14','每年生日复刻'],['永无岛','7.3–7.22'],['澄风掠海','8.12–8.31'],['灼频过载','10.29–11.18'],['慵懒共谋','12.8–12.14']]},
 {id:'s5',name:'常驻五星卡',sub:'5★ standard',stars:5,cards:[['远空迷航','1.22–2.8'],['远空棠雨','1.22–2.8'],['无尽夏','1.22–2.8'],['暗潮边缘','1.22–2.8'],['限定余味','1.22–2.8'],['槐序','7.12–7.27'],['偏航线','9.17–9.27']]},
 {id:'e4',name:'四星探测卡 · 活动卡',sub:'4★ event',stars:4,cards:[['绕金枝','1.22–2.8'],['适配留言','1.22–2.9'],['离途幻乐','3.28–4.11'],['离途密触','3.28–4.11'],['奔夏一刻','9.13–10.1'],['潮湿盛野','12.31–1.21','6.22 签到活动复刻'],['残宵莲烬','3.28–4.10'],['残宵绯梦','3.28–4.10'],['跃跃纸端','8.24–9.11']]},
 {id:'s4',name:'四星常驻卡',sub:'4★ standard',stars:4,cards:[['长昼如昨','1.22–2.8'],['长昼顷刻','1.22–2.8'],['回夏','1.22–2.8'],['天际线','1.22–2.8'],['戏中局外','1.22–2.8'],['预支约定','1.22–2.8']]},
 {id:'my',name:'密约卡',sub:'4★ 密约',stars:4,cards:[['寂落假象','3.9–5.6'],['焚线','8.31–10.28'],['牵夜灼灼','12.31–1.21'],['倾目如驻','4.30–6.27'],['漓漓愫意','10.21–12.18']]},
 {id:'e3',name:'三星探测卡 · 活动卡',sub:'3★ event',stars:3,cards:[['终结','3.28–4.11'],['他心引力','6.8–6.14'],['莲结','3.28–4.10'],['飒然当空','6.8–6.14']]},
 {id:'s3',name:'三星常驻卡',sub:'3★ standard',stars:3,cards:[['能量满格','1.22–2.8'],['保持联络','1.22–2.8'],['遥想','1.22–2.8'],['字句沉浸','1.22–2.8'],['满分苹果','1.22–2.8'],['会心一击','1.22–2.8']]}
];
const CARDS=[];CARD_CATS.forEach(c=>c.cards.forEach((k,i)=>CARDS.push({id:c.id+'-'+(i+1),cat:c.id,name:k[0],date:k[1],rerun:k[2]||'',stars:c.stars})));
const CARD_BY_ID=Object.fromEntries(CARDS.map(c=>[c.id,c]));
const CATALOG=[
 {id:'2026-10',label:'2026.10 · 新春 羊羊得亿',groups:[['羊羊得亿',[['吉祥如意按摩锤',65],['羊生赢家流沙徽章',18],['瑞羊呈祥春联',35],['财羊双全扫扫乐毛绒组合',59],['羊光普照新春套组',45]]]]},
 {id:'2026-09',label:'2026.09 · 周边图鉴（一）',groups:[['于深空见证的系列',[['誓约见证小卡组',18],['多用领结挂件',49],['马口铁徽章',18],['刺绣纪念方巾',39],['誓约手记纸品套组',55],['誓言笺色纸套组',49],['捧花秋千玩偶',118],['誓约戒托手办',88],['亚克力多插立牌',68]]],['只此一刻系列',[['鼠标垫',70],['马口铁徽章',18],['影像定格套组',25],['抽拉签名板',39]]],['缔夜派对系列',[['衍射卡',12],['随身收纳包',69],['小夜灯磁吸冰箱贴',39]]]]},
 {id:'2026-08',label:'2026.08',groups:[['春天对花所做的事',[['马口铁徽章',18],['小卡组',18],['马尾抓夹',45],['花影色纸',36],['亚克力装饰画',88],['花信折页辑',42]]],['甜梦如织',[['纽扣毛绒',49],['地毯',69],['拖鞋',59],['抓夹组',35],['睡衣',188],['掌心好眠手办',88]]],['心许佳期',[['马口铁徽章',18],['明信片组',12],['多层文件夹',49]]]]},
 {id:'2026-06b',label:'2026.06 · 生日 & 冥罗之主',groups:[['2026年生日',[['珍藏马口铁徽章',18],['典藏马口铁徽章',18],['小卡套组',18],['宽幅拍立得组',28],['光影纪念册',39],['立绘立牌',58],['Q版保护套徽章组',24]]],['冥罗之主',[['方形马口铁徽章（每款）',18],['马口铁徽章（每款）',18],['光栅小卡套',36],['臻藏折页书',68],['磁吸多层摆件（每款）',75],['熠彩流光全景色纸（每款）',39],['剪影追迹套组',39],['大师海报',20],['印象披肩',149],['印象披肩扣',149],['印象卡包',59],['亚克力立牌',58]]]]},
 {id:'2026-06',label:'2026.06',groups:[['心约漫行',[['多功能收纳百贴布',45],['毛绒娃娃',79],['多用毛绒束口袋',45]]],['相拥萦怀',[['仲夏蜜果专属香水 30ml',285],['仲夏蜜果专属香水 50ml',430]]]]},
 {id:'2026-05',label:'2026.05',groups:[['往日回信',[['邮品纪念礼盒',198]]],['旧日回音',[['黄铜书签',32],['收纳记录本',89],['邮戳印象印章',45],['钢笔收纳组',149]]],['浮光小憩',[['软胶坐姿玩偶',58],['立体毛绒浴球',32],['注油杯垫',39],['水机玩具挂件',39]]]]},
 {id:'2026-03',label:'2026.03',groups:[['明日无处可逃',[['马口铁徽章',18],['光感小卡组',18],['绕线器立牌',58],['通缉海报',20],['两用颈饰',79],['缉查档案相卡组',68]]],['驻心予你',[['纸裱留影画',45],['马口铁徽章',18],['立牌',68]]],['炽型定格',[['方形马口铁徽章',18],['温感撕拉相卡组',20]]],['春野漫歌',[['餐碗',45],['餐具套组',39],['餐盘',49]]],['绒绒派对',[['毛绒娃娃',259]]],['禁区追踪',[['托特包',159],['随心夹套组',45],['档案夹小卡套组',29],['多用织毯',129],['链条渔夫帽',79],['牛仔挎包',79],['多功能挂件',45],['中性笔组',19]]]]},
 {id:'2026-02',label:'2026.02 · GSC 粘土人',groups:[['GSC粘土人',[['粘土人手办（含配件）',319]]]]},
 {id:'2026-01',label:'2026.01',groups:[['猫猫求带走',[['键帽盒蛋',39]]],['漫野趣途',[['便携化妆镜',35],['洗漱包',69],['随行杯',89],['迷你马口铁徽章套组',18],['车车摆件',89],['打卡牌',29]]]]},
 {id:'2025-11',label:'2025.11 · 第八期 & 2026新春',groups:[['漫冬行记',[['毛绒娃娃',79],['马口铁徽章',15],['口袋日程本',35],['多用卡包',69],['两用购物袋',39]]],['终极兵器X-02',[['方形马口铁徽章',18],['马口铁徽章',15],['多帧光栅相卡组',24],['夜光流沙摆件',75],['爆闪色纸（每款）',36],['角色印象丝巾',79],['角色印象发圈',28],['角色亚克力立牌',68]]],['2026新春系列',[['2026年纪念台历',68],['春联套组',58],['福挂',45]]]]},
 {id:'2025-10',label:'2025.10 · 万达联名',groups:[['万达联名',[['爆米花桶+可乐杯',49.9],['镭射票套组',26],['马口铁徽章',18],['亚克力挂件',39],['挂画',69]]]]},
 {id:'2025-08',label:'2025.08 · 第七期',groups:[['心途拾光',[['马口铁徽章',18],['立牌',68],['明信片套组',12]]],['玩心时光',[['叠叠乐',19.9],['冰箱贴',25],['团子挂件',45]]],['猫很想你',[['磁吸毛绒娃娃',69],['抽拉便签',25],['马口铁徽章',15],['冰格',45],['马克杯',79]]]]},
 {id:'2025-07',label:'2025.07',groups:[['2025BW',[['相卡组',45],['海报',20],['合影透扇',20]]],['致朝暮与久长',[['专属定制戒指',258]]],['日日同行',[['毛绒娃娃',149],['毛绒胸针',28]]]]},
 {id:'2025-06',label:'2025.06 · 生日 & CD & 竹林浅语',groups:[['2025生日',[['典藏马口铁徽章',18],['珍藏马口铁徽章',18],['Q版马口铁徽章',15],['立绘立牌',58],['小卡套组',18],['拍立得组',24],['毛绒挂件',58]]],['深空的回响 CD专辑',[['CD专辑礼盒',298]]],['竹林浅语',[['毛绒娃娃',89],['马口铁徽章',18],['毛绒胸针',28],['毛绒挂件',45],['毛绒包',118],['拍立得组',24],['拍立得卡册',39]]]]},
 {id:'2025-05',label:'2025.05 · 第六期',groups:[['心语轻诉',[['马口铁徽章',18],['小卡组',18],['旋转立牌',59],['心迹四格套组',39]]],['云游拾光',[['毛绒娃娃',79],['刺绣徽章',15],['行李牌',39],['马口铁徽章',18],['Q版迷你奖章',36]]],['超越巅峰',[['护照夹票根组',69]]]]},
 {id:'2025-03',label:'2025.03 · 第五期',groups:[['心绪定格',[['马口铁徽章',15],['无边晶彩色纸',36]]],['绒心相拥',[['手机支架',25],['毛绒大头抱枕',168],['毛绒手机挂绳',48]]],['光影拾常',[['挂件',42],['5寸相卡',10]]]]}
];

const FANDOMS=[
 {id:'lads',name:'Love and Deepspace',short:'恋与深空',sub:'夏以昼'},
 {id:'exo',name:'EXO',short:'EXO',sub:'EXO-L'},
 {id:'svt',name:'SEVENTEEN',short:'SEVENTEEN',sub:'CARAT'},
 {id:'and2ble',name:'and2ble',short:'and2ble',sub:''}
];
const KPOP=FANDOMS.slice(1).map(f=>f.id);
const BIASES=[{id:'chanyeol',name:'Chanyeol',sub:'찬열 · EXO',group:'exo',pick:x=>x.cat==='EXO 专辑'||x.cat==='CHANYEOL SOLO'},{id:'baekhyun',name:'Baekhyun',sub:'백현 · EXO',group:'exo',pick:x=>x.cat==='EXO 专辑'||x.cat==='BAEKHYUN SOLO'},{id:'dokyeom',name:'Dokyeom',sub:'도겸 · SEVENTEEN',group:'svt',pick:x=>true},{id:'gyuvin',name:'Gyuvin',sub:'규빈 · and2ble',group:'and2ble',pick:x=>true},{id:'caleb',name:'Caleb',sub:'夏以昼 · 恋与深空',group:'lads',re:null}];
const BIAS_GROUP=Object.fromEntries(BIASES.map(b=>[b.id,b.group]));let CUR_BIAS='chanyeol';
const BIAS_KIND={pc:'Photocard',album:'Album',merch:'Merch',fansign:'Fansign / event',other:'Other'};
const FNAME=Object.fromEntries(FANDOMS.map(f=>[f.id,f.name]));
const SPEND_TYPES=[['topup','钻石充值 Top-up'],['monthly','月卡 Monthly pass'],['pass','通行证 / 大月卡'],['bundle','礼包 Bundle'],['event','活动礼包 Event pack'],['other','Other']];
const SPEND_LABEL=Object.fromEntries(SPEND_TYPES);
const KINDS={lightstick:'Lightstick',tour:'Tour merch',sg:"Season's greetings",pc:'Photocards',membership:'Membership',fanmade:'Fan-made',other:'Other'};
const CURS=['SGD','CNY','KRW','USD','MYR','JPY','HKD','THB','TWD'];
const DEFAULT_RATES={SGD:1,CNY:0.18,KRW:0.00093,USD:1.29,MYR:0.30,JPY:0.0086,HKD:0.165,THB:0.039,TWD:0.040};
const SYM={SGD:'S$',CNY:'¥',KRW:'₩',USD:'US$',MYR:'RM',JPY:'¥',HKD:'HK$',THB:'฿',TWD:'NT$'};
const LOCAL_KEY='fandom-wallet-v1';
const COLLS=['spend','merch','concerts','albums','kmerch','bubble','bias'];

/* ---------- storage ---------- */
const S={mode:'pending',db:null,spend:[],merch:[],concerts:[],albums:[],kmerch:[],bubble:[],bias:[],owned:{},kown:{},game:{checkins:{},claims:{},seen:null,budget:0},school:{todos:[],deadlines:[],focus:{},events:null,focusLen:25},settings:{home:'SGD',rates:{...DEFAULT_RATES}},ready:false};
const writeQ={};
function queueDocWrite(path,get){const q=writeQ[path]||(writeQ[path]={busy:false,dirty:false});q.dirty=true;q.get=get;if(q.busy)return;
  setTimeout(async()=>{q.busy=true;while(q.dirty){q.dirty=false;try{await S.db.doc(path).set(q.get())}catch(e){toast(errMsg(e))}}q.busy=false},400)}
function errMsg(e){return e&&e.code==='quota_exceeded'?'Storage is full. Delete some old entries to add more.':'Could not save. Check your connection and try again.'}
function loadLocal(){try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'null')}catch(e){return null}}
function saveLocal(){if(S.mode!=='local')return;try{const o={owned:S.owned,kown:S.kown,game:S.game,school:S.school,settings:S.settings};COLLS.forEach(c=>o[c]=S[c]);localStorage.setItem(LOCAL_KEY,JSON.stringify(o))}catch(e){}}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
async function initStore(){
  let db=null;try{if(window.claude&&window.claude.use)db=await window.claude.use('db')}catch(e){db=null}
  if(db){S.db=db;S.mode='db';setStatus('on','Saved to your account');let got=0;
    COLLS.forEach(c=>db.collection(c).onSnapshot(s=>{S[c]=s.docs.map(d=>({...d.data(),id:d.id}));render();if(++got===COLLS.length){S.ready=true;offerImport()}},onDbErr));
    db.doc('meta/school').onSnapshot(s=>{const q=writeQ['meta/school'];if(!(q&&(q.busy||q.dirty))&&s.exists)S.school={todos:[],deadlines:[],focus:{},events:null,focusLen:25,...s.data()};render()},onDbErr);
    db.doc('meta/game').onSnapshot(s=>{const q=writeQ['meta/game'];if(!(q&&(q.busy||q.dirty))&&s.exists)S.game={checkins:{},claims:{},seen:null,budget:0,...s.data()};S.gameLoaded=true;render()},onDbErr);
    db.doc('meta/kcol').onSnapshot(s=>{const q=writeQ['meta/kcol'];if(!(q&&(q.busy||q.dirty)))S.kown=(s.exists&&s.data().owned)||{};render()},onDbErr);
    db.doc('meta/cards').onSnapshot(s=>{const q=writeQ['meta/cards'];if(!(q&&(q.busy||q.dirty)))S.owned=(s.exists&&s.data().owned)||{};render()},onDbErr);
    db.doc('meta/settings').onSnapshot(s=>{if(s.exists){const d=s.data();S.settings={home:d.home||'SGD',rates:{...DEFAULT_RATES,...(d.rates||{})}}}render();renderRates()},onDbErr);
  }else{S.mode='local';const j=loadLocal();if(j){COLLS.forEach(c=>S[c]=j[c]||[]);S.owned=j.owned||{};S.kown=j.kown||{};if(j.game)S.game={...S.game,...j.game};if(j.school)S.school={...S.school,...j.school};if(j.settings)S.settings={home:j.settings.home||'SGD',rates:{...DEFAULT_RATES,...j.settings.rates}}}
    setStatus('warn','Saved on this device');S.ready=true;render();renderRates()}
}
function onDbErr(e){setStatus('warn',e&&e.code==='revoked'?'Read-only now':'Sync paused')}
function setStatus(k,t){$('#dot').className='dot '+k;$('#statusText').textContent=t}
function offerImport(){const j=loadLocal();if(!j)return;const n=COLLS.reduce((a,c)=>a+(j[c]||[]).length,0)+Object.keys(j.owned||{}).length;if(!n||COLLS.some(c=>S[c].length))return;
  const box=$('#importBox');box.hidden=false;box.innerHTML=`<span>Found ${n} entries saved earlier in this browser.</span><button class="btn" id="doImport">Move them to your account</button>`;
  $('#doImport').onclick=async()=>{box.hidden=true;for(const c of COLLS)for(const r of j[c]||[])await putRow(c,r);S.owned={...j.owned,...S.owned};queueDocWrite('meta/cards',()=>({owned:S.owned}));toast('Imported ♡');try{localStorage.removeItem(LOCAL_KEY)}catch(e){}}}
async function putRow(coll,row){if(!row.id)row.id=uid();
  if(S.mode==='db'){const {id,...body}=row;try{await S.db.collection(coll).doc(id).set(body)}catch(e){toast(errMsg(e))}}
  else{const a=S[coll],i=a.findIndex(r=>r.id===row.id);if(i>=0)a[i]=row;else a.push(row);saveLocal();render()}}
async function delRow(coll,id){if(S.mode==='db'){try{await S.db.collection(coll).doc(id).delete()}catch(e){toast(errMsg(e))}}else{S[coll]=S[coll].filter(r=>r.id!==id);saveLocal();render()}}
function setKown(id,val){if(val)S.kown[id]=today();else delete S.kown[id];S.kown={...S.kown};if(S.mode==='db')queueDocWrite('meta/kcol',()=>({owned:S.kown}));else saveLocal();render()}
function setOwned(id,val){if(val)S.owned[id]=today();else delete S.owned[id];S.owned={...S.owned};if(S.mode==='db')queueDocWrite('meta/cards',()=>({owned:S.owned}));else saveLocal();render()}
function saveSettings(){if(S.mode==='db')queueDocWrite('meta/settings',()=>S.settings);else saveLocal();render()}

/* ---------- helpers ---------- */
function $(s,r=document){return r.querySelector(s)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toHome(a,cur){return (+a||0)*(S.settings.rates[cur]??DEFAULT_RATES[cur]??1)/(S.settings.rates[S.settings.home]||1)}
function fmt(n,cur){cur=cur||S.settings.home;const d=(cur==='KRW'||cur==='JPY')?0:2;return (SYM[cur]||cur+' ')+(+n||0).toLocaleString('en-SG',{minimumFractionDigits:d,maximumFractionDigits:d})}
function fmtShort(n){const s=SYM[S.settings.home]||'';return n>=1000?s+(n/1000).toFixed(n>=10000?0:1)+'k':s+Math.round(n)}
function today(){const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)}
function ym(d){return (d||'').slice(0,7)}
function monthName(k){const [y,m]=k.split('-');return new Date(+y,+m-1,1).toLocaleString('en',{month:'long'})+' '+y}
function prettyDate(d){if(!d)return '';return new Date(d+'T00:00').toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric',weekday:'short'})}
function daysTo(d){return Math.round((new Date(d+'T00:00')-new Date(today()+'T00:00'))/864e5)}
let toastT;function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),1800)}
const COST={bias:r=>(+r.price||0)*(+r.qty||1),bubble:r=>+r.amount||0,spend:r=>+r.amount||0,merch:r=>(+r.price||0)*(+r.qty||1)+(+r.ship||0),concerts:r=>(+r.ticket||0)+(+r.travel||0)+(+r.hotel||0)+(+r.other||0),albums:r=>(+r.price||0)*(+r.qty||1)+(+r.ship||0),kmerch:r=>(+r.price||0)*(+r.qty||1)+(+r.ship||0)};
function home(c,r){if(c==='concerts')return toHome(r.ticket,r.cur)+toHome((+r.travel||0)+(+r.hotel||0)+(+r.other||0),r.cur2||r.cur);return toHome(COST[c](r),r.cur)}
function fandomOf(c,r){return c==='bias'?BIAS_GROUP[r.bias]:(c==='spend'||c==='merch')?'lads':r.group}
function rowsOf(f){const bx=['bias',S.bias.filter(r=>BIAS_GROUP[r.bias]===f)];return f==='lads'?[['spend',S.spend],['merch',S.merch],bx]:[bx,['concerts',S.concerts.filter(r=>r.group===f)],['albums',S.albums.filter(r=>r.group===f)],['kmerch',S.kmerch.filter(r=>r.group===f)],['bubble',S.bubble.filter(r=>r.group===f)]]}
function totalOf(f,pred){return rowsOf(f).reduce((a,[c,rs])=>a+rs.filter(r=>!pred||pred(r)).reduce((x,r)=>x+home(c,r),0),0)}
function sumC(c,rs){return rs.reduce((a,r)=>a+home(c,r),0)}

/* ---------- navigation ---------- */
let VIEW='home';const SUB={lads:'cards',kpop:'collection',bias:'coll'};
const NAVI={game:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M16 6h3a3 3 0 0 1-3 4M8 6H5a3 3 0 0 0 3 4M12 13v4M8 20h8"/>',home:'<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>',bias:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',lads:'<path d="M3 11l18-7-6 16-3.5-6.5z"/>',exo:'<circle cx="12" cy="8" r="4"/><path d="M12 12v8"/>',svt:'<path d="M12 4l2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8z"/>',and2ble:'<path d="M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10z"/><circle cx="12" cy="11" r="2.4"/>'};
function renderNav(){
  const act=VIEW==='school'?'school':VIEW==='journey'?'journey':VIEW==='game'?'game':(VIEW==='me'||VIEW==='settings')?'me':'home';
  const tabs=[['game','Quests','📜'],['home','Collect','🧸'],['school','School','🎓'],['me','Mochi','__pet']];
  $('#fandoms').innerHTML=tabs.map(([id,l,e])=>`<button class="fd" data-view="${id}" aria-current="${act===id}"><span class="nb">${e==='__pet'?petSVG():e}</span><span>${l}</span></button>`).join('');
  $('#backbar').hidden=!(KPOP.includes(VIEW)||VIEW==='lads'||VIEW==='bias');
}
function go(v){VIEW=v;document.body.className='f-'+(v==='school'?'school':v==='settings'||v==='game'||v==='journey'||v==='me'?'home':v==='bias'?'b-'+CUR_BIAS:v);$('#v-bias').hidden=v!=='bias';$('#v-game').hidden=v!=='game';$('#v-journey').hidden=v!=='journey';$('#v-school').hidden=v!=='school';$('#v-me').hidden=v!=='me';
  $('#v-home').hidden=v!=='home';$('#v-lads').hidden=v!=='lads';$('#v-kpop').hidden=!KPOP.includes(v);$('#v-settings').hidden=v!=='settings';
  ['concerts','albums','kmerch'].forEach(c=>{if(EDIT[c])resetForm(c)});
  try{localStorage.setItem(LOCAL_KEY+':view',v)}catch(e){}
  renderNav();applySub();render();window.scrollTo({top:0})}
function mountMascots(){}
function applySub(){
  document.querySelectorAll('.seg').forEach(seg=>{const k=seg.dataset.seg;seg.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',b.dataset.sub===SUB[k]))});
  document.querySelectorAll('[data-pane]').forEach(p=>{const [k,s]=p.dataset.pane.split(':');p.hidden=SUB[k]!==s});
}

/* ---------- render ---------- */
function render(){
  if(VIEW==='bias')renderBias();else if(VIEW==='game')renderGame();else if(VIEW==='journey')renderJourney();else if(VIEW==='school')renderSchool();else if(VIEW==='me')renderMe();else if(VIEW==='home'){renderHome();renderPrograms()}else if(VIEW==='lads')renderLads();else if(KPOP.includes(VIEW))renderKpop(VIEW);
  applyStage();checkBadges();
  const o={owned:S.owned,kown:S.kown,game:S.game,school:S.school,settings:S.settings};COLLS.forEach(c=>o[c]=S[c]);$('#backup').value=JSON.stringify(o,null,1);
  try{window.dispatchEvent(new Event('fq-legacy-change'))}catch(e){}
}
function mascot(size=40,mood='happy'){const m=mood==='happy'?'<path d="M17 26c2 2.6 6 2.6 8 0" stroke="#3a2f4f" stroke-width="2.2" fill="none" stroke-linecap="round"/>':'<path d="M18 27c2-1.6 4-1.6 6 0" stroke="#3a2f4f" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  return `<svg class="mascot" width="${size}" height="${size}" viewBox="0 0 42 42" aria-hidden="true"><rect x="3" y="9" width="36" height="28" rx="11" fill="var(--c1)"/><path d="M3 18a9 9 0 0 1 9-9h18a9 9 0 0 1 9 9z" fill="var(--c2)"/><circle cx="15" cy="22" r="2.3" fill="#3a2f4f"/><circle cx="27" cy="22" r="2.3" fill="#3a2f4f"/><circle cx="15.8" cy="21.2" r=".8" fill="#fff"/><circle cx="27.8" cy="21.2" r=".8" fill="#fff"/><ellipse cx="11" cy="27" rx="2.8" ry="1.8" fill="#ff8fb1" opacity=".75"/><ellipse cx="31" cy="27" rx="2.8" ry="1.8" fill="#ff8fb1" opacity=".75"/>${m}<path d="M33 4c0-1.6 2.4-2.2 3.1-.5.7-1.7 3.1-1.1 3.1.5 0 2.1-3.1 3.8-3.1 3.8S33 6.1 33 4z" fill="#ff7aa2"/></svg>`}
function pop(el){return;if(matchMedia('(prefers-reduced-motion: reduce)').matches||!el)return;const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;const sym=['♥','✦','♥','★','♡'];const cs=getComputedStyle(document.body);const col=[cs.getPropertyValue('--c1'),cs.getPropertyValue('--c2'),'#ff8fb1'];
  for(let i=0;i<14;i++){const s=document.createElement('span');s.className='pop';s.textContent=sym[i%sym.length];const a=Math.random()*Math.PI*2,d=40+Math.random()*50;s.style.left=x+'px';s.style.top=y+'px';s.style.color=col[i%3];s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d-20+'px');s.style.setProperty('--r',(Math.random()*120-60)+'deg');document.body.appendChild(s);setTimeout(()=>s.remove(),950)}}
function emptyBox(html){return `<div class="empty">${html}</div>`}
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function stat(v,l){return `<div class="stat"><b>${v}</b><span>${l}</span></div>`}
function niceStep(x){if(!x)return 25;const p=Math.pow(10,Math.floor(Math.log10(x)));const f=x/p;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p}

function renderHome(){
  const all=FANDOMS.reduce((a,f)=>a+totalOf(f.id),0);const y=today().slice(0,4),m=today().slice(0,7);
  const yr=FANDOMS.reduce((a,f)=>a+totalOf(f.id,r=>r.date?.startsWith(y)),0),mo=FANDOMS.reduce((a,f)=>a+totalOf(f.id,r=>r.date?.startsWith(m)),0);
  $('#h-total').innerHTML=fmt(all);
  const shows=S.concerts.filter(r=>r.status!=='missed').length;
  $('#h-stats').innerHTML=stat(fmt(yr),'this year')+stat(fmt(mo),'this month')+stat(`${CARDS.filter(c=>S.owned[c.id]).length}/${CARDS.length}`,'夏以昼 cards')+stat(shows,'concerts');
  $('#h-bias').innerHTML=BIASES.map(x=>{const lg=S.bias.filter(r=>r.bias===x.id);return `<button class="bp f-b-${x.id}" data-bias="${x.id}">${avHTML(x)}<span>${esc(x.name)}</span></button>`}).join('');
  $('#h-tiles').innerHTML=FANDOMS.map(f=>{let s;if(f.id==='lads')s=`${CARDS.filter(c=>S.owned[c.id]).length}/${CARDS.length} cards`;else{const sh=S.concerts.filter(r=>r.group===f.id&&r.status!=='missed').length,al=S.albums.filter(r=>r.group===f.id).reduce((a,r)=>a+(+r.qty||1),0);s=`${sh} show${sh===1?'':'s'} · ${al} album${al===1?'':'s'}`}
    return `<button class="tile f-${f.id}" data-view="${f.id}"><div class="band"></div><div class="in"><div class="nm">${esc(f.name)}</div><div class="v">${fmt(totalOf(f.id))}</div><div class="s">${s}</div></div></button>`}).join('');
  // chart
  const months=[];const d=new Date();for(let i=11;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);months.push(x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'))}
  const vals=months.map(k=>FANDOMS.map(f=>totalOf(f.id,r=>ym(r.date)===k)));
  const mx=Math.max(0,...vals.map(v=>v.reduce((a,b)=>a+b,0)));const step=niceStep(mx/4);const top=Math.max(step*4,step*Math.ceil(mx/step));
  const W=560,H=220,L=48,R=8,T=10,B=26,cw=(W-L-R)/12,ph=H-T-B,sc=v=>ph*v/top;const col={lads:'var(--lads1)',exo:'var(--exo1)',svt:'var(--svt1)',and2ble:'var(--and1)'};let g='';
  for(let i=0;i<=Math.round(top/step);i++){const v=i*step,yy=T+ph-sc(v);g+=`<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-dasharray="${i?'3 4':''}"/><text x="${L-6}" y="${yy+3}" text-anchor="end">${fmtShort(v)}</text>`}
  months.forEach((k,i)=>{const x=L+i*cw+cw*.16,w=cw*.68;let acc=0;const tot=vals[i].reduce((a,b)=>a+b,0);vals[i].forEach((v,j)=>{if(!v)return;const h=sc(v);const isTop=acc+h>=sc(tot)-0.01;g+=`<rect x="${x}" y="${T+ph-acc-h}" width="${w}" height="${Math.max(h,1)}" fill="${col[FANDOMS[j].id]}" rx="${isTop?6:0}"><title>${monthName(k)} · ${FANDOMS[j].name} ${fmt(v)}</title></rect>`;acc+=h});
    const [yy,mm]=k.split('-');g+=`<text x="${x+w/2}" y="${H-10}" text-anchor="middle">${mm==='01'||i===0?yy.slice(2)+'/'+mm:mm}</text>`});
  $('#h-chart').innerHTML=g;$('#h-legend').innerHTML=FANDOMS.map(f=>`<span><i style="background:${col[f.id]}"></i>${esc(f.short)}</span>`).join('');
  const t=today();const up=S.concerts.filter(r=>r.date>=t&&r.status!=='missed').sort((a,b)=>a.date.localeCompare(b.date)).slice(0,2);
  $('#h-next').innerHTML=up.length?up.map(r=>ticket(r,false)).join(''):emptyBox('No upcoming shows yet. Open a group and add one under <b>Concerts</b> once you have tickets.');
  const rec=[];COLLS.forEach(c=>S[c].forEach(r=>rec.push([c,r])));rec.sort((a,b)=>(b[1].date||'').localeCompare(a[1].date||'')||(b[1].id>a[1].id?1:-1));
  $('#h-recent').innerHTML=rec.length?`<div class="list">${rec.slice(0,6).map(([c,r])=>anyRow(c,r,false)).join('')}</div>`:emptyBox('Nothing logged yet. Pick a fandom above to add your first top-up, album or ticket ♡');
}

function renderLads(){
  const ig=sumC('spend',S.spend),me=sumC('merch',S.merch),own=CARDS.filter(c=>S.owned[c.id]).length,pend=S.merch.filter(r=>r.status&&r.status!=='received').length;
  $('#l-total').innerHTML=fmt(ig+me)+'<small>spent</small>';
  $('#l-stats').innerHTML=stat(fmt(ig),'in-game')+stat(fmt(me),'merch')+stat(`${own}/${CARDS.length}`,'cards')+(pend?stat(pend,'merch on the way'):'');
  renderShipWait();
  if(SUB.lads==='ingame')$('#spendList').innerHTML=byMonth('spend',S.spend,'No in-game spending yet. Use the form above for each top-up, monthly pass or bundle.');
  if(SUB.lads==='merch')$('#merchList').innerHTML=byMonth('merch',S.merch,'No merch logged yet. Add it above, or open <b>Catalog</b> and tap + on what you bought.');
  if(SUB.lads==='cards')renderCards();
  if(SUB.lads==='catalog')renderCatalog();
}
function renderKpop(g){
  const f=FANDOMS.find(x=>x.id===g);const cs=S.concerts.filter(r=>r.group===g),as=S.albums.filter(r=>r.group===g),ms=S.kmerch.filter(r=>r.group===g),bs=S.bubble.filter(r=>r.group===g);
  $('#k-kicker').textContent=f.sub?`${f.sub} · concerts, albums, merch`:'concerts, albums, merch';$('#k-name').textContent=f.name;
  $('#k-total').innerHTML=fmt(sumC('concerts',cs)+sumC('albums',as)+sumC('kmerch',ms)+sumC('bubble',bs)+sumC('bias',S.bias.filter(r=>BIAS_GROUP[r.bias]===g)))+'<small>spent</small>';
  $('#k-stats').innerHTML=stat(fmt(sumC('concerts',cs)),plural(cs.filter(r=>r.status!=='missed').length,'concert'))+stat(fmt(sumC('albums',as)),plural(as.reduce((a,r)=>a+(+r.qty||1),0),'album'))+stat(fmt(sumC('kmerch',ms)),'merch')+(bs.length?stat(fmt(sumC('bubble',bs)),'Bubble'):'');
  if(SUB.kpop==='bubble')renderBubble(g,bs);
  $('#c-tour').placeholder=`e.g. ${f.name} World Tour in Singapore`;
  if(SUB.kpop==='concerts'){const el=$('#list-concerts');if(!cs.length){el.innerHTML=emptyBox(`No ${esc(f.name)} concerts yet. Add a show above, with flights and hotel if you travelled for it.`)}else{const t=today();const up=cs.filter(r=>r.date>=t).sort((a,b)=>a.date.localeCompare(b.date)),past=cs.filter(r=>r.date<t).sort((a,b)=>b.date.localeCompare(a.date));
    el.innerHTML=(up.length?`<h2>Upcoming</h2>${up.map(r=>ticket(r)).join('')}`:'')+(past.length?`<h2>Been there</h2>${past.map(r=>ticket(r)).join('')}`:'')}}
  if(SUB.kpop==='collection')renderKcol(g);
  if(SUB.kpop==='albums')$('#list-albums').innerHTML=byMonth('albums',as,`No ${esc(f.name)} albums yet. Add each purchase above, with how many copies and which photocards you pulled.`);
  if(SUB.kpop==='merch')$('#list-kmerch').innerHTML=byMonth('kmerch',ms,`No ${esc(f.name)} merch yet. Lightsticks, tour merch and season's greetings all go here.`);
}
let KFILTER='all';const KCAT_LABEL={'all':'All','owned':'Owned ♡','missing':'Missing'};
function renderKcol(g){
  const list=KCOL[g]||[];const own=list.filter(x=>S.kown[x.id]).length;
  const p=list.length?own/list.length:0,R=26,C=2*Math.PI*R;
  $('#kring').innerHTML=`<circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--sunk)" stroke-width="9"/><circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--c1)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C*p} ${C}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="14" fill="var(--ink)">${Math.round(p*100)}%</text>`;
  $('#kringTxt').textContent=list.length?`${own} of ${list.length} collected`:'No catalog yet';
  const cats=[...new Set(list.map(x=>x.cat))];if(!cats.includes(KFILTER)&&!KCAT_LABEL[KFILTER])KFILTER='all';
  $('#kFilter').innerHTML=list.length?['all','owned','missing',...cats].map(k=>`<button class="chip" aria-pressed="${KFILTER===k}" data-kf="${esc(k)}">${esc(KCAT_LABEL[k]||k)}</button>`).join(''):'';
  $('#kSearch').parentElement.hidden=!list.length;
  if(!list.length){$('#kGrid').innerHTML=emptyBox(`No photo catalog for ${esc(FNAME[g])} yet. Send me screenshots of their albums or merch and I'll add them here.`);return}
  const q=($('#kSearch').value||'').trim().toLowerCase();
  let xs=list.filter(x=>KFILTER==='all'||(KFILTER==='owned'?S.kown[x.id]:KFILTER==='missing'?!S.kown[x.id]:x.cat===KFILTER));
  if(q)xs=xs.filter(x=>(x.cat+' '+x.sec+' '+x.name).toLowerCase().includes(q));
  const logged={};S.albums.concat(S.kmerch).forEach(r=>{if(r.kid)logged[r.kid]=(logged[r.kid]||0)+(+r.qty||1)});
  const by=[];const idx={};xs.forEach(x=>{const k=x.cat+'|'+x.sec;if(!(k in idx)){idx[k]=by.length;by.push([x,[]])}by[idx[k]][1].push(x)});
  $('#kGrid').innerHTML=by.length?by.map(([h,its])=>{const o=its.filter(x=>S.kown[x.id]).length;
    return `<div class="release"><h3>${esc(h.sec)} <span class="pill c num">${o}/${its.length}</span></h3><div class="items">${its.map(x=>`<div class="item${S.kown[x.id]?' got':''}"><span class="heart">♥${logged[x.id]?' ×'+logged[x.id]:''}</span><button class="ph kph" data-kown="${x.id}" aria-pressed="${!!S.kown[x.id]}" aria-label="${esc(x.name)}"><img src="${KCOL_IMG[x.id]}" alt="" loading="lazy"></button><div class="n">${esc(x.name)}</div><div class="foot"><span class="p">${x.price?fmt(x.price,x.cur||'CNY'):''}</span><button class="add" data-klog="${x.id}" aria-label="Log purchase of ${esc(x.name)}">+</button></div></div>`).join('')}</div></div>`}).join(''):emptyBox('Nothing matches. Try another filter or search.');
}
function calebMerch(){const bought={};S.merch.forEach(m=>{if(m.catKey)bought[m.catKey]=(bought[m.catKey]||0)+(+m.qty||1)});
  const all=[];CATALOG.forEach(r=>r.groups.forEach(([s,its])=>its.forEach(([n,p])=>all.push([r,s,n,p]))));const got=all.filter(([r,s,n])=>bought[catKey(r.id,s,n)]).length;
  return `<h2 style="margin-top:34px">夏以昼 周边 <span class="pill c num">${got}/${all.length}</span></h2>`+CATALOG.map(r=>`<div class="release"><h3>${esc(r.label)}</h3>${r.groups.map(([s,its])=>`<div class="series">${esc(s)}</div><div class="items">${its.map(([n,p])=>{const k=catKey(r.id,s,n),b=bought[k];return `<div class="item${b?' got':''}"><div class="ph"><img src="${MERCH_IMG[k]||''}" alt="${esc(n)}" loading="lazy"></div><div class="n">${esc(n)}${b>1?` ×${b}`:''}</div><div class="foot"><span class="p">¥${p}</span><button class="add" data-cat="${esc(k)}" data-p="${p}" aria-label="Log ${esc(n)}">+</button></div></div>`}).join('')}</div>`).join('')}</div>`).join('')}
function biasItems(b){if(b.id==='caleb')return [];return (KCOL[b.group]||[]).filter(b.pick)}
function renderBias(){
  const b=BIASES.find(x=>x.id===CUR_BIAS);document.body.className='f-b-'+b.id;
  $('#biasPick').innerHTML=BIASES.map(x=>`<button class="bp f-b-${x.id}" data-bias="${x.id}" aria-pressed="${x.id===b.id}">${avHTML(x)}<span>${esc(x.name)}</span></button>`).join('');
  const log=S.bias.filter(r=>r.bias===b.id);const its=biasItems(b);const ids=new Set(its.map(x=>x.id));
  let spent=sumC('bias',log),own,tot;
  spent+=sumC('albums',S.albums.filter(r=>ids.has(r.kid)))+sumC('kmerch',S.kmerch.filter(r=>ids.has(r.kid)));
  if(b.id==='caleb'){spent+=sumC('spend',S.spend)+sumC('merch',S.merch);own=CARDS.filter(c=>S.owned[c.id]).length;tot=CARDS.length}else{own=its.filter(x=>S.kown[x.id]).length;tot=its.length}
  const pcs=log.filter(r=>r.kind==='pc').reduce((a,r)=>a+(+r.qty||1),0);
  $('#biasHero').innerHTML=`<div class="bh">${avHTML(b,true)}<div><div class="kicker">${esc(b.sub)}</div><h1>${esc(b.name)} ♡</h1></div></div><div class="big num">${fmt(spent)}<small>spent on him</small></div><div class="stats">${stat(`${own}/${tot}`,b.id==='caleb'?'cards':'items')}${stat(pcs,'photocards')}${stat(log.length,'logged')}</div>`;
  if(SUB.bias==='coll'){
    if(b.id==='caleb'){const spentBy={};S.spend.forEach(r=>{if(r.card)spentBy[r.card]=(spentBy[r.card]||0)+home('spend',r)});
      $('#biasColl').innerHTML=CARD_CATS.map(c=>{const cs=CARDS.filter(x=>x.cat===c.id);const o=cs.filter(x=>S.owned[x.id]).length;return `<div class="cat"><div class="cat-h"><h3>${esc(c.name)}<small>${o}/${cs.length}</small></h3></div><div class="cards">${cs.map(x=>`<button class="card${S.owned[x.id]?' own':''}" data-card="${x.id}" aria-pressed="${!!S.owned[x.id]}"><div class="img"><img src="${THUMBS[x.id]}" alt="${esc(x.name)}" loading="lazy"><span class="check">♥</span></div><span class="nm">${esc(x.name)}</span></button>`).join('')}</div></div>`}).join('')+calebMerch()}
    else if(!its.length){$('#biasColl').innerHTML=emptyBox(`No ${esc(b.name)} items in the catalog yet. Log his photocards and member versions under <b>Photocards &amp; items</b>, or send me screenshots of his merch.`)}
    else{const by=[];const idx={};its.forEach(x=>{const k=x.cat+'|'+x.sec;if(!(k in idx)){idx[k]=by.length;by.push([x,[]])}by[idx[k]][1].push(x)});
      $('#biasColl').innerHTML=by.map(([h,xs])=>`<div class="release"><h3>${esc(/SOLO|小分队/.test(h.cat)&&!h.sec.includes(h.cat.split(' ')[0])?h.cat+' · '+h.sec:h.sec)} <span class="pill c num">${xs.filter(x=>S.kown[x.id]).length}/${xs.length}</span></h3><div class="items">${xs.map(x=>`<div class="item${S.kown[x.id]?' got':''}"><span class="heart">♥</span><button class="ph kph" data-kown="${x.id}" aria-pressed="${!!S.kown[x.id]}" aria-label="${esc(x.name)}"><img src="${KCOL_IMG[x.id]}" alt="" loading="lazy"></button><div class="n">${esc(x.name)}</div></div>`).join('')}</div></div>`).join('')}
  }
  if(SUB.bias==='log')$('#biasList').innerHTML=byMonth('bias',log,`Nothing logged for ${esc(b.name)} yet. Add his photocards, member versions and goods above ♡`);
}
function addMonths(d,n){const x=new Date(d+'T00:00');x.setMonth(x.getMonth()+n);return x.toISOString().slice(0,10)}
function renderBubble(g,bs){
  const by={};bs.forEach(r=>{const k=(r.member||'').trim();if(!k)return;(by[k]||(by[k]=[])).push(r)});
  const t=today();const subs=Object.entries(by).map(([m,rs])=>{rs.sort((a,b)=>(b.date||'').localeCompare(a.date||''));const last=rs[0];const until=addMonths(last.date,+last.months||1);return {m,last,until,active:until>=t,total:sumC('bubble',rs),n:rs.length}}).sort((a,b)=>b.active-a.active||b.until.localeCompare(a.until));
  const act=subs.filter(s=>s.active);const monthly=act.reduce((a,s)=>a+toHome(s.last.amount,s.last.cur)/(+s.last.months||1),0);
  $('#b-members').innerHTML=Object.keys(by).map(m=>`<option value="${esc(m)}">`).join('');
  $('#bubbleSubs').innerHTML=subs.length?`<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:8px"><b class="num" style="font-size:15px">My Bubble subscriptions</b><span class="num" style="color:var(--cink);font-weight:600">${fmt(monthly)} / month · ${act.length} active</span></div>`+
    `<div class="list">${subs.map(s=>{const d=daysTo(s.until);return `<div class="row" style="grid-template-columns:1fr auto auto"><div class="t"><div>💬 ${esc(s.m)}${s.active?`<span class="pill c">${d<=3?`renews in ${d} day${d===1?'':'s'}`:'active'}</span>`:'<span class="pill">ended</span>'}</div><div class="s">Paid ${s.n} time${s.n===1?'':'s'} · until ${esc(prettyDate(s.until))}</div></div><div class="amt">${fmt(s.total)}<span class="h">${fmt(s.last.amount,s.last.cur)} last</span></div><div class="acts"><button class="btn sm" style="padding:4px 12px;font-size:12px" data-renew="${esc(s.m)}">Renew ♡</button></div></div>`}).join('')}</div>`
    :`<div class="muted" style="font-weight:600;font-size:13px">💬 Track your Bubble chats here. Add a payment below for each member you subscribe to, then tap <b style="color:var(--cink)">Renew ♡</b> each month to log it again in one tap.</div>`;
  $('#list-bubble').innerHTML=byMonth('bubble',bs,`No Bubble payments for ${esc(FNAME[g])} yet.`);
}
function byMonth(c,rows,emptyMsg){
  if(!rows.length)return emptyBox(emptyMsg);
  const by={};rows.forEach(r=>(by[ym(r.date)]||(by[ym(r.date)]=[])).push(r));
  return Object.keys(by).sort().reverse().map(k=>{const rs=by[k].sort((a,b)=>(b.date||'').localeCompare(a.date||''));return `<div class="month"><div class="month-h"><b>${k?monthName(k):'No date'}</b><span class="num">${fmt(sumC(c,rs))}</span></div><div class="list">${rs.map(r=>anyRow(c,r,true)).join('')}</div></div>`}).join('');
}
function anyRow(c,r,acts){
  if(c==='concerts'){return rowShell(c,r,acts,`<span class="fdot"></span>${esc(r.tour)}<span class="pill c">concert</span>`,esc([r.city,r.seat].filter(Boolean).join(' · ')),home(c,r),S.settings.home)}
  const f=fandomOf(c,r);let title,sub;
  if(c==='spend'){const cd=r.card&&CARD_BY_ID[r.card];title=`${esc(SPEND_LABEL[r.type]||'In-game')}<span class="pill c">in-game</span>${cd?`<span class="pill c2">${esc(cd.name)}</span>`:''}`;sub=esc(r.note||'')}
  else if(c==='merch'){const st={ordered:'Ordered',shipped:'Shipped'}[r.status];title=`${esc(r.name)}${(+r.qty||1)>1?` ×${r.qty}`:''}<span class="pill c2">merch</span>${st?`<span class="pill">${st}</span>`:''}${shipPill(r)}`;sub=esc([r.series,r.note].filter(Boolean).join(' · '))}
  else if(c==='albums'){title=`${esc(r.title)}${r.ver?` <span class="muted">· ${esc(r.ver)}</span>`:''}${(+r.qty||1)>1?` ×${r.qty}`:''}<span class="pill c">album</span>`;sub=esc([r.pc&&('PC: '+r.pc),r.src].filter(Boolean).join(' · '))}
  else if(c==='bias'){const bb=BIASES.find(b=>b.id===r.bias);title=`${esc(r.item)}${(+r.qty||1)>1?` ×${r.qty}`:''}<span class="pill c">${esc(BIAS_KIND[r.kind]||'')}</span>${!acts&&bb?`<span class="pill">♡ ${esc(bb.name)}</span>`:''}`;sub=esc(r.note||'')}
  else if(c==='bubble'){const mo=+r.months||1;title=`${esc(r.member)}<span class="pill c">Bubble</span>${mo>1?`<span class="pill">${mo} months</span>`:''}`;sub=esc(r.note||'')}
  else{title=`${esc(r.item)}${(+r.qty||1)>1?` ×${r.qty}`:''}<span class="pill c2">${esc(KINDS[r.kind]||'merch')}</span>`;sub=esc(r.note||'')}
  if(!acts&&f!=='lads')title=`<span class="fdot"></span>`+title;
  return rowShell(c,r,acts,title,sub,COST[c](r),r.cur,c==='merch'&&r.catKey?MERCH_IMG[r.catKey]:(r.kid&&KCOL_IMG[r.kid])||'');
}
function rowShell(c,r,acts,title,sub,cost,cur,img){
  return `<div class="row f-${fandomOf(c,r)}"><span class="d">${esc((r.date||'').slice(5).replace('-','.'))}</span><div class="t${img?' has-img':''}">${img?`<img class="rth" src="${img}" alt="">`:''}<div style="min-width:0"><div>${title}</div>${sub?`<div class="s">${sub}</div>`:''}</div></div><div class="amt">${fmt(cost,cur)}${cur!==S.settings.home?`<span class="h">${fmt(toHome(cost,cur))}</span>`:''}</div><div class="acts">${acts?`<button class="icon-btn" data-edit="${c}:${r.id}">Edit</button><button class="icon-btn" data-del="${c}:${r.id}">Delete</button>`:''}</div></div>`;
}
function ticket(r,acts=true){
  const c2=r.cur2||r.cur,mixed=c2!==r.cur,c=mixed?home('concerts',r):COST.concerts(r),cc=mixed?S.settings.home:r.cur,n=daysTo(r.date),past=n<0;
  const lab=r.status==='missed'?'missed':past?(r.status==='attended'?'attended ♡':'past'):n===0?'today!!':`in ${n} day${n===1?'':'s'}`;
  const parts=[['Ticket',r.ticket,r.cur],['Travel',r.travel,c2],['Hotel',r.hotel,c2],['Other',r.other,c2]].filter(p=>+p[1]).map(p=>`${p[0]} ${fmt(p[1],p[2])}`).join(' · ');
  return `<div class="ticket f-${r.group}${past||r.status==='missed'?' past':''}"><div class="main"><div class="grp">${esc(FNAME[r.group]||'')}</div><div class="tour">${esc(r.tour)}</div><div class="meta">${esc([r.venue,r.city].filter(Boolean).join(', '))}${r.seat?` · ${esc(r.seat)}`:''}</div>${acts&&parts?`<div class="meta num" style="font-size:12px">${parts}</div>`:''}${acts&&r.note?`<div class="meta">${esc(r.note)}</div>`:''}</div><div class="stub"><span class="days">${lab}</span><span class="when">${esc(prettyDate(r.date))}</span><span class="cost">${fmt(c,cc)}</span>${acts?`<div class="acts"><button class="icon-btn" data-edit="concerts:${r.id}">Edit</button><button class="icon-btn" data-del="concerts:${r.id}">Delete</button></div>`:''}</div></div>`;
}

let CARD_FILTER='all';
function renderCards(){
  const own=CARDS.filter(c=>S.owned[c.id]).length,p=own/CARDS.length,R=26,C=2*Math.PI*R;
  $('#ring').innerHTML=`<circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--sunk)" stroke-width="9"/><circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--c2)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C*p} ${C}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="600" font-size="14" fill="var(--ink)">${Math.round(p*100)}%</text>`;
  $('#ringTxt').textContent=`${own} of ${CARDS.length} cards collected`;
  const spentBy={};S.spend.forEach(r=>{if(r.card)spentBy[r.card]=(spentBy[r.card]||0)+home('spend',r)});
  $('#cardFilter').innerHTML=[['all','All'],['owned','Owned'],['missing','Missing'],['5','5★ only']].map(([k,v])=>`<button class="chip" aria-pressed="${CARD_FILTER===k}" data-cf="${k}">${v}</button>`).join('');
  $('#cardGrid').innerHTML=CARD_CATS.map(c=>{let cs=CARDS.filter(x=>x.cat===c.id);
    if(CARD_FILTER==='owned')cs=cs.filter(x=>S.owned[x.id]);if(CARD_FILTER==='missing')cs=cs.filter(x=>!S.owned[x.id]);if(CARD_FILTER==='5'&&c.stars!==5)cs=[];if(!cs.length)return '';
    const o=CARDS.filter(x=>x.cat===c.id&&S.owned[x.id]).length;
    return `<div class="cat"><div class="cat-h"><h3>${esc(c.name)}<small>${esc(c.sub)}</small></h3><span class="num muted">${o}/${c.cards.length}</span></div><div class="cards">${cs.map(x=>`<button class="card${S.owned[x.id]?' own':''}" data-card="${x.id}" aria-pressed="${!!S.owned[x.id]}" title="${esc(x.name)}${x.rerun?' · '+esc(x.rerun):''}"><div class="img"><img src="${THUMBS[x.id]}" alt="${esc(x.name)}" loading="lazy"><span class="check"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" fill="var(--c2)" stroke="#fff" stroke-width="2"/></svg></span>${spentBy[x.id]?`<span class="spent">${fmtShort(spentBy[x.id])}</span>`:''}</div><span class="nm">${esc(x.name)}</span><span class="dt">${esc(x.date)}${x.rerun?' · 复':''}</span></button>`).join('')}</div></div>`}).join('')||'<div class="empty">No cards match this filter.</div>';
}
function catKey(r,s,n){return r+'|'+s+'|'+n}
function renderCatalog(){
  const q=($('#catSearch').value||'').trim().toLowerCase();const bought={};S.merch.forEach(m=>{if(m.catKey)bought[m.catKey]=(bought[m.catKey]||0)+(+m.qty||1)});
  $('#catalog').innerHTML=CATALOG.map(r=>{const gs=r.groups.map(([s,items])=>{const its=items.filter(([n])=>!q||(n+s+r.label).toLowerCase().includes(q));if(!its.length)return '';
      return `<div class="series">${esc(s)}</div><div class="items">${its.map(([n,p])=>{const k=catKey(r.id,s,n),b=bought[k];return `<div class="item${b?' got':''}"><span class="heart">♥ ×${b||0}</span><div class="ph">${MERCH_IMG[k]?`<img src="${MERCH_IMG[k]}" alt="${esc(n)}" loading="lazy">`:''}</div><div class="n">${esc(n)}</div><div class="foot"><span class="p">¥${p}</span><button class="add" data-cat="${esc(k)}" data-p="${p}" aria-label="Log ${esc(n)}">+</button></div></div>`}).join('')}</div>`}).join('');
    if(!gs)return '';const tot=r.groups.reduce((a,[s,its])=>a+its.reduce((x,[n,p])=>x+(bought[catKey(r.id,s,n)]||0)*p,0),0);
    return `<div class="release"><h3>${esc(r.label)}${tot?`<span class="pill c2 num">¥${tot.toFixed(tot%1?1:0)} bought</span>`:''}</h3>${gs}</div>`}).join('')||'<div class="empty">No items match your search.</div>';
}

/* ---------- forms ---------- */
const FORMS={
  spend:{p:'sp',form:'#spendForm',f:{date:'date',amount:'amt',cur:'cur',type:'type',card:'card',note:'note'},num:['amount'],label:'Add spend',keep:['date','cur','type']},
  merch:{p:'m',form:'#merchForm',f:{name:'name',series:'series',date:'date',price:'price',qty:'qty',cur:'cur',ship:'ship',src:'src',status:'status',note:'note'},num:['price','qty','ship'],label:'Add merch',keep:['date','cur','src','status']},
  concerts:{p:'c',form:'#f-concerts',f:{tour:'tour',city:'city',venue:'venue',date:'date',seat:'seat',cur:'cur',ticket:'ticket',cur2:'cur2',travel:'travel',hotel:'hotel',other:'other',status:'status',note:'note'},num:['ticket','travel','hotel','other'],label:'Add concert',keep:['cur','cur2','date','status'],group:true},
  albums:{p:'a',form:'#f-albums',f:{title:'title',ver:'ver',date:'date',qty:'qty',price:'price',cur:'cur',ship:'ship',src:'src',pc:'pc'},num:['qty','price','ship'],label:'Add album',keep:['cur','date'],group:true},
  bias:{p:'x',form:'#f-bias',f:{item:'item',kind:'kind',date:'date',qty:'qty',price:'price',cur:'cur',note:'note'},num:['qty','price'],label:'Add for him ♡',keep:['cur','date','kind']},
  bubble:{p:'b',form:'#f-bubble',f:{member:'member',date:'date',amount:'amount',cur:'cur',months:'months',note:'note'},num:['amount','months'],label:'Add Bubble payment',keep:['cur','date','months'],group:true},
  kmerch:{p:'k',form:'#f-kmerch',f:{item:'item',kind:'kind',date:'date',qty:'qty',price:'price',cur:'cur',ship:'ship',note:'note'},num:['qty','price','ship'],label:'Add merch',keep:['cur','date','kind'],group:true}
};
const EDIT={};let pendingCatKey='';let PENDING_KID='';
document.querySelectorAll('select[id$="-cur"],select[id$="-cur2"]').forEach(el=>{el.innerHTML=CURS.map(x=>`<option>${x}</option>`).join('');el.value='SGD'});
$('#m-cur').value='CNY';
$('#sp-type').innerHTML=SPEND_TYPES.map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
$('#sp-card').innerHTML='<option value="">—</option>'+CARD_CATS.map(c=>`<optgroup label="${esc(c.name)}">${CARDS.filter(x=>x.cat===c.id).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</optgroup>`).join('');
document.querySelectorAll('input[type=date]').forEach(el=>el.value=today());
Object.entries(FORMS).forEach(([c,F])=>{
  $(F.form).addEventListener('submit',e=>{e.preventDefault();const prev=EDIT[c]&&S[c].find(x=>x.id===EDIT[c]);const r={...(prev||{}),id:EDIT[c]||uid()};
    for(const [k,id] of Object.entries(F.f)){const v=$(`#${F.p}-${id}`).value;r[k]=F.num.includes(k)?(+v||0):v.trim()}
    if('qty' in r&&!r.qty)r.qty=1;if(F.group&&!prev)r.group=VIEW;if(c==='bias'&&!prev)r.bias=CUR_BIAS;if(c==='merch'&&!prev&&pendingCatKey)r.catKey=pendingCatKey;if(c==='merch'){const v=$('#m-shipin').value.trim();r.shipBy=v===''?'':addDaysISO(today(),Math.max(0,Math.round(+v)||0))}if((c==='albums'||c==='kmerch')&&!prev&&PENDING_KID){r.kid=PENDING_KID;if(!S.kown[PENDING_KID])setKown(PENDING_KID,true)}
    if(!EDIT[c])pop($(`#${F.p}-submit`));putRow(c,r);toast(EDIT[c]?'Updated ♡':'Added ♡');resetForm(c)});
  $(`#${F.p}-cancel`).onclick=()=>resetForm(c);
});
function resetForm(c){const F=FORMS[c];EDIT[c]=null;if(c==='merch'){pendingCatKey='';$('#m-shipin').value=''}if(c==='albums'||c==='kmerch')PENDING_KID='';
  for(const [k,id] of Object.entries(F.f))if(!F.keep.includes(k))$(`#${F.p}-${id}`).value='';
  if($(`#${F.p}-qty`))$(`#${F.p}-qty`).value=1;$(`#${F.p}-submit`).textContent=F.label;$(`#${F.p}-cancel`).hidden=true;$(`#${F.p}-flag`).textContent=''}

document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
  if(t.dataset.view){go(t.dataset.view);return}
  if(t.dataset.sub){const k=t.closest('.seg').dataset.seg;SUB[k]=t.dataset.sub;try{localStorage.setItem(LOCAL_KEY+':sub',JSON.stringify(SUB))}catch(e){}applySub();render();return}
  if(t.dataset.card){const id=t.dataset.card,on=!S.owned[id];if(on)pop(t);setOwned(id,on);if(on){const el=document.querySelector(`[data-card="${id}"]`);if(el){el.classList.add('just');setTimeout(()=>el.classList.remove('just'),500)}}return}
  if(t.dataset.cf){CARD_FILTER=t.dataset.cf;renderCards();return}
  if(t.dataset.renew){const rs=S.bubble.filter(r=>r.group===VIEW&&(r.member||'').trim()===t.dataset.renew).sort((a,b)=>(b.date||'').localeCompare(a.date||''));const l=rs[0];if(!l)return;pop(t);putRow('bubble',{id:uid(),group:VIEW,member:l.member,date:today(),amount:l.amount,cur:l.cur,months:+l.months||1,note:l.note||''});toast('Renewed ♡');return}
  if(t.dataset.kf){KFILTER=t.dataset.kf;renderKcol(VIEW);return}
  if(t.dataset.kown){const id=t.dataset.kown,on=!S.kown[id];if(on)pop(t);setKown(id,on);return}
  if(t.dataset.klog){const x=(KCOL[VIEW]||[]).find(y=>y.id===t.dataset.klog);if(!x)return;const merch=x.cat==='周边';const c=merch?'kmerch':'albums';resetForm(c);PENDING_KID=x.id;
    if(merch){$('#k-item').value=x.name;$('#k-kind').value='other'}else{$('#a-title').value=x.sec.replace(/^(SEVENTEEN 专辑|KiHNO|Photobook|Membership Kit|Concert DVD \/ Blu-ray \/ DC)$/,'')||x.sec;if(['SEVENTEEN 专辑','KiHNO','Photobook','Membership Kit','Concert DVD / Blu-ray / DC'].includes(x.sec)){$('#a-title').value=x.name;$('#a-ver').value=x.cat}else $('#a-ver').value=x.name}
    const p=merch?'k':'a';if(x.price){$(`#${p}-price`).value=x.price;$(`#${p}-cur`).value=x.cur||'CNY'}$(`#${p}-date`).value=today();
    SUB.kpop=merch?'merch':'albums';applySub();render();$(`#${p}-flag`).textContent='From your collection. Add the price, then save.';$(FORMS[c].form).scrollIntoView({behavior:'smooth',block:'center'});if(!x.price)$(`#${p}-price`).focus();return}
  if(t.dataset.del){if(t.dataset.armed){const [c,id]=t.dataset.del.split(':');delRow(c,id);toast('Deleted')}else{t.dataset.armed=1;t.textContent='Sure?';setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent='Delete'}},3000)}return}
  if(t.dataset.bias){CUR_BIAS=t.dataset.bias;try{localStorage.setItem(LOCAL_KEY+':bias',CUR_BIAS)}catch(e){}if(EDIT.bias)resetForm('bias');go('bias');return}
  if(t.dataset.edit){const [c,id]=t.dataset.edit.split(':');const r=S[c].find(x=>x.id===id);if(!r)return;const F=FORMS[c];
    if(c==='bias'){CUR_BIAS=r.bias;go('bias');SUB.bias='log';applySub();render();EDIT[c]=id;for(const [k,fid] of Object.entries(F.f))$(`#x-${fid}`).value=r[k]??'';$('#x-submit').textContent='Save changes';$('#x-cancel').hidden=false;$('#x-flag').textContent='Editing an entry';$(F.form).scrollIntoView({behavior:'smooth',block:'center'});return}
    if(F.group&&VIEW!==r.group)go(r.group);const sk=F.group?'kpop':'lads';const sub={spend:'ingame',merch:'merch',concerts:'concerts',albums:'albums',bubble:'bubble',kmerch:'merch'}[c];if(SUB[sk]!==sub){SUB[sk]=sub;applySub();render()}
    EDIT[c]=id;for(const [k,fid] of Object.entries(F.f))$(`#${F.p}-${fid}`).value=r[k]??(k==='cur2'?r.cur:'');if(c==='merch')$('#m-shipin').value=r.shipBy?Math.max(0,daysTo(r.shipBy)):'';
    $(`#${F.p}-submit`).textContent='Save changes';$(`#${F.p}-cancel`).hidden=false;$(`#${F.p}-flag`).textContent='Editing an entry';$(F.form).scrollIntoView({behavior:'smooth',block:'center'});return}
  if(t.dataset.cat){if(VIEW!=='lads')go('lads');const [rid,s,n]=t.dataset.cat.split('|');const rel=CATALOG.find(r=>r.id===rid);resetForm('merch');pendingCatKey=t.dataset.cat;
    $('#m-name').value=n;$('#m-series').value=s+(rel?' · '+rel.label.split(' ·')[0]:'');$('#m-price').value=t.dataset.p;$('#m-cur').value='CNY';$('#m-date').value=today();$('#m-status').value='ordered';
    SUB.lads='merch';applySub();render();$('#m-flag').textContent='From the catalog. Check the details, then add.';$('#merchForm').scrollIntoView({behavior:'smooth',block:'center'});return}
});
$('#catSearch').addEventListener('input',renderCatalog);
$('#kSearch').addEventListener('input',()=>renderKcol(VIEW));


/* ---------- game ---------- */
function saveGame(){S.game={...S.game};if(S.mode==='db')queueDocWrite('meta/game',()=>S.game);else saveLocal()}
function dstr(d){return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)}
function weekStart(){const d=new Date();const k=(d.getDay()+6)%7;d.setDate(d.getDate()-k);return dstr(d)}
function streak(){const c=S.game.checkins||{};let d=new Date();if(!c[dstr(d)])d.setDate(d.getDate()-1);let n=0;while(c[dstr(d)]){n++;d.setDate(d.getDate()-1)}return n}
function sitData(){const sc=S.school;return {todos:sc.todos||[],cds:allDeadlines(),ics:schedule().length,focus:Object.values(sc.focus||{}).reduce((a,b)=>a+b,0)}}
function stats(){
  const cardsOwned=CARDS.filter(c=>S.owned[c.id]).length;const kAll=Object.values(KCOL).flat();const kOwned=kAll.filter(x=>S.kown[x.id]);
  const by=g=>(KCOL[g]||[]).filter(x=>S.kown[x.id]).length;const goods=new Set(S.merch.filter(m=>m.catKey).map(m=>m.catKey)).size;
  const t=today();const shows=S.concerts.filter(r=>r.status!=='missed'&&(r.status==='attended'||r.date<t));
  const logs=COLLS.reduce((a,c)=>a+S[c].length,0);const checks=Object.keys(S.game.checkins||{}).length;const claims=Object.keys(S.game.claims||{}).length;
  const lim26=CARDS.filter(c=>c.cat==='l26').every(c=>S.owned[c.id]);
  const kihno=(KCOL.svt||[]).filter(x=>x.cat==='KiHNO'&&S.kown[x.id]).length;
  const sd=sitData();const gd=Object.values(S.school.goalDone||{}).reduce((a,v)=>a+v.length,0);return {goalsN:gd,focusN:sd.focus,todosDone:sd.todos.filter(x=>x.done).length,cardsOwned,kOwned:kOwned.length,exo:by('exo'),svt:by('svt'),and2:by('and2ble'),goods,shows:shows.length,abroad:shows.some(r=>r.city&&!/singapore|新加坡/i.test(r.city)),logs,checks,claims,lim26,kihno,bubble:S.bubble.length,biasLogs:S.bias.length,streak:streak()};
}
function monthSpent(ym){return FANDOMS.reduce((a,f)=>a+totalOf(f.id,r=>(r.date||'').startsWith(ym)),0)}
function lastMonth(){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-1);return dstr(d).slice(0,7)}
const BADGES=[
 ['first-card','🃏','First Pull','Own your first 夏以昼 card',s=>s.cardsOwned>=1],
 ['caleb-half','🍎','Halfway to Caleb','Own 28 of his cards',s=>s.cardsOwned>=28],
 ['caleb-lim','👑','Limited Royalty','Own every 2026 限定卡',s=>s.lim26],
 ['caleb-all','💯','Complete Caleb','Own all 56 cards',s=>s.cardsOwned>=56],
 ['goods-5','🧸','谷子 Collector','Log 5 items from the 周边 catalog',s=>s.goods>=5],
 ['exo-10','🌙','EXO-L Shelf','Own 10 EXO items',s=>s.exo>=10],
 ['svt-20','💎','CARAT Shelf','Own 20 SEVENTEEN items',s=>s.svt>=20],
 ['kihno-5','📀','KiHNO Kid','Own 5 SEVENTEEN KiHNO albums',s=>s.kihno>=5],
 ['and2-1','🍀','Curious One','Own your first and2ble item',s=>s.and2>=1],
 ['show-1','🎤','Concert Debut','Go to your first concert',s=>s.shows>=1],
 ['show-abroad','✈️','Flight Mode','See a concert outside Singapore',s=>s.abroad],
 ['show-3','🎆','Tour Life','Go to 3 concerts',s=>s.shows>=3],
 ['bubble-3','💬','Bubble Buddy','Log 3 Bubble payments',s=>s.bubble>=3],
 ['bias-5','💗','Bias Wrecked','Log 5 things for your biases',s=>s.biasLogs>=5],
 ['streak-3','🔥','Warming Up','Check in 3 days in a row',s=>s.streak>=3||s.best>=3],
 ['streak-7','🔥','On Fire','Check in 7 days in a row',s=>s.streak>=7||s.best>=7],
 ['streak-30','🌟','Devoted','Check in 30 days in a row',s=>s.streak>=30||s.best>=30],
 ['budget','🐷','Budget Hero','Stay under your budget for a whole month',s=>S.game.budget>0&&S.game.budgetSince&&S.game.budgetSince<=lastMonth()&&monthSpent(lastMonth())<=S.game.budget],
 ['focus-1','🌱','First Sprout','Finish a focus session',s=>s.focusN>=1],
 ['focus-10','🌷','Green Thumb','Finish 10 focus sessions',s=>s.focusN>=10],
 ['study-10','📚','Study Buddy','Finish 10 school to-dos',s=>s.todosDone>=10],
 ['quests-5','📜','Quest Master','Claim 5 weekly quests',s=>s.claims>=5],
 ['lv-5','⭐','Rising Star','Reach level 5',s=>s.level>=5],
 ['lv-10','🏆','Super Fan','Reach level 10',s=>s.level>=10]];
const TITLES=[[1,'Newbie Fan'],[3,'Casual Stan'],[6,'Dedicated Stan'],[10,'Super Fan'],[15,'Ultimate Stan'],[20,'Legend']];
function xpOf(s){return (s.goalsN||0)*5+s.focusN*10+s.todosDone*5+s.cardsOwned*10+s.kOwned*8+s.goods*8+s.logs*3+s.shows*30+s.checks*5+s.claims*30}
function levelOf(xp){const L=Math.floor((Math.sqrt(1+8*xp/100)-1)/2)+1;const a=100*(L-1)*L/2,b=100*L*(L+1)/2;return {L,into:xp-a,need:b-a}}
function bestStreak(){const ds=Object.keys(S.game.checkins||{}).sort();let best=0,run=0,prev=null;ds.forEach(d=>{if(prev&&(new Date(d)-new Date(prev))/864e5===1)run++;else run=1;best=Math.max(best,run);prev=d});return best}
function gameState(){const s=stats();s.best=bestStreak();let xp=xpOf(s);let lv=levelOf(xp);s.level=lv.L;
  const un=BADGES.filter(b=>b[4](s));xp+=un.length*25;lv=levelOf(xp);s.level=lv.L;
  const title=TITLES.filter(x=>lv.L>=x[0]).pop()[1];return {s,xp,lv,title,un}}
function quests(){const ws=weekStart();const inWeek=d=>d&&d>=ws;const s=S.game.checkins||{};
  const ck=Object.keys(s).filter(inWeek).length;const added=Object.values(S.owned).concat(Object.values(S.kown)).filter(inWeek).length;
  const spentWk=FANDOMS.reduce((a,f)=>a+totalOf(f.id,r=>inWeek(r.date)),0);const b=S.game.budget||0;
  return [{id:'checkin',e:'🌤️',name:'Check in 5 days',p:ck,n:5},{id:'collect',e:'🧩',name:'Add 3 things to your collection',p:added,n:3},
   b?{id:'save',e:'🐷',name:`Spend under ${fmt(b/4.3)} this week`,p:spentWk<=b/4.3?1:0,n:1,ok:spentWk<=b/4.3,note:`${fmt(spentWk)} so far`}:{id:'save',e:'🐷',name:'Set a monthly budget below',p:0,n:1,locked:true}].map(q=>({...q,key:ws+':'+q.id,done:q.p>=q.n,claimed:!!(S.game.claims||{})[ws+':'+q.id]}))}
function playerCard(full){const g=gameState();const st=g.s.streak;const did=(S.game.checkins||{})[today()];
  return `<div class="pl-top"><div class="lvl"><span>LV</span><b>${g.lv.L}</b></div><div class="pl-mid"><div class="pl-title">${esc(g.title)}</div><div class="xpbar"><span style="width:${Math.round(g.lv.into/g.lv.need*100)}%"></span></div><div class="pl-xp num">${g.lv.into} / ${g.lv.need} XP${full?` · ${g.xp} total`:''}</div></div><div class="streak${st?'':' cold'}"><span>🔥</span><b class="num">${st}</b><small>day${st===1?'':'s'}</small></div></div>
  <div class="pl-act"><button class="btn ${did?'':'primary'} checkin" data-checkin ${did?'disabled':''}>${did?'Checked in today ✓':'Daily check-in · +5 XP'}</button>${full?'':`<button class="btn" data-view="game">Rewards · ${g.un.length}/${BADGES.length} 🏆</button>`}</div>`}
function renderGame(){const g=gameState();$('#g-player').innerHTML=playerCard(true);
  const ws=weekStart();$('#g-week').textContent='resets Monday';
  $('#g-quests').innerHTML=quests().map(q=>`<div class="quest${q.claimed?' claimed':''}"><span class="qe">${q.e}</span><div class="qm"><div class="qn">${esc(q.name)}</div><div class="qbar"><span style="width:${Math.min(100,q.p/q.n*100)}%"></span></div><div class="qs num">${q.locked?'Set a budget to unlock':q.note||`${Math.min(q.p,q.n)} / ${q.n}`}</div></div>${q.claimed?'<span class="qdone">+30 ✓</span>':`<button class="btn ${q.done?'primary':''}" data-claim="${q.key}" ${q.done?'':'disabled'}>Claim +30</button>`}</div>`).join('');
  const b=S.game.budget||0,m=monthSpent(today().slice(0,7)),pct=b?Math.min(100,m/b*100):0;
  $('#g-budget').innerHTML=`<div class="bud"><div><div class="qn">This month ${b?`<span class="muted">· ${fmt(m)} of ${fmt(b)}</span>`:''}</div><div class="qbar big ${b&&m>b?'over':pct>80?'warn':''}"><span style="width:${pct}%"></span></div><div class="qs">${b?(m>b?`Over by ${fmt(m-b)}. You've got this next month 💪`:`${fmt(b-m)} left. Stay under to earn 🐷 Budget Hero.`):'Pick a monthly fan budget. Staying under it earns badges and weekly XP.'}</div></div><form class="bud-f" id="budgetForm"><input type="number" id="g-budgetIn" min="0" step="1" placeholder="e.g. 200" value="${b||''}"><button class="btn primary" type="submit">${b?'Update':'Set budget'}</button></form></div>`;
  $('#g-love').innerHTML=BIASES.map(x=>{let own,tot;if(x.id==='caleb'){own=CARDS.filter(c=>S.owned[c.id]).length;tot=CARDS.length}else{const its=biasItems(x);own=its.filter(i=>S.kown[i.id]).length;tot=its.length}
    const lg=S.bias.filter(r=>r.bias===x.id).length;const p=tot?own/tot:0;const hearts=Math.min(5,Math.round(p*5+lg*0.2));
    return `<button class="row love-row f-b-${x.id}" data-bias="${x.id}">${avHTML(x)}<div class="t"><div>${esc(x.name)}</div><div class="s">${own}/${tot} collected · ${lg} logged</div></div><span class="hearts">${'♥'.repeat(hearts)}<i>${'♥'.repeat(5-hearts)}</i></span></button>`}).join('');
  const un=new Set(g.un.map(b=>b[0]));$('#g-badgeCount').textContent=`${un.size}/${BADGES.length}`;
  $('#g-badges').innerHTML=BADGES.map(b=>`<div class="badge${un.has(b[0])?' got':''}"><span class="be">${un.has(b[0])?b[1]:'🔒'}</span><b>${esc(b[2])}</b><small>${esc(b[3])}</small></div>`).join('');
}
function checkBadges(){if(!S.ready||(S.mode==='db'&&!S.gameLoaded))return;const g=gameState();const ids=g.un.map(b=>b[0]);
  if(!S.game.seen){S.game.seen=Object.fromEntries(ids.map(i=>[i,today()]));S.game.lastLevel=g.lv.L;saveGame();return}
  const fresh=g.un.filter(b=>!S.game.seen[b[0]]);let msg='';
  let bd=null;if(fresh.length){fresh.forEach(b=>S.game.seen[b[0]]=today());msg=`You earned a new badge`;bd=fresh[0]}
  if(g.lv.L>(S.game.lastLevel||1)){msg=`Level ${g.lv.L} · ${g.title}`}
  if(msg){S.game.lastLevel=Math.max(g.lv.L,S.game.lastLevel||1);saveGame();celebrate(msg,bd)}}
function celebrate(m,badge){const g=gameState();$('#lmSub').textContent=m;$('#lmXp').textContent=g.xp;$('#lmStreak').textContent=g.s.streak;
  $('#lmBadge').hidden=!badge;if(badge){$('#lmBadgeT').textContent=badge[2]+' unlocked';$('#lmBadgeD').textContent=badge[3];$('#lmBadgeE').textContent=badge[1]}
  $('#lvlModal').hidden=false;$('#lmGo').focus()}
document.addEventListener('click',e=>{if(e.target.id==='lmGo'||e.target.id==='lvlModal')$('#lvlModal').hidden=true});
document.addEventListener('submit',e=>{if(e.target.id!=='budgetForm')return;e.preventDefault();const v=+$('#g-budgetIn').value||0;S.game.budget=v;if(v&&!S.game.budgetSince)S.game.budgetSince=today().slice(0,7);if(!v)delete S.game.budgetSince;saveGame();render();toast(v?'Budget set':'Budget cleared')});
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
  if(t.hasAttribute('data-checkin')){S.game.checkins={...(S.game.checkins||{}),[today()]:1};saveGame();render();toast(`Checked in · 🔥 ${streak()} day streak`);return}
  if(t.dataset.claim){S.game.claims={...(S.game.claims||{}),[t.dataset.claim]:today()};saveGame();render();toast('Quest claimed · +30 XP');return}
});



/* ---------- lightsticks (original illustrations in each fandom's colours) ---------- */
const LS={
 exo:`<svg viewBox="0 0 120 230"><defs><radialGradient id="lsx" cx=".42" cy=".38"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#f3f5fb"/><stop offset="1" stop-color="#cfd5e4"/></radialGradient></defs><circle cx="60" cy="66" r="50" fill="url(#lsx)"/><circle cx="60" cy="66" r="50" fill="none" stroke="#fff" stroke-width="3" opacity=".9"/><g fill="#fff8e6"><circle cx="45" cy="52" r="3"/><circle cx="74" cy="46" r="2"/><circle cx="68" cy="80" r="3.2"/><circle cx="46" cy="84" r="2"/><circle cx="60" cy="64" r="4.5"/></g><rect x="40" y="112" width="40" height="14" rx="6" fill="#dfe3ec" stroke="#9aa1b2" stroke-width="2"/><rect x="48" y="124" width="24" height="96" rx="11" fill="#eceff5" stroke="#9aa1b2" stroke-width="2"/><rect x="55" y="140" width="10" height="16" rx="4" fill="#c4cad8"/></svg>`,
 svt:`<svg viewBox="0 0 120 230"><defs><linearGradient id="lss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7cac9"/><stop offset="1" stop-color="#92a8d1"/></linearGradient><radialGradient id="lsh"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="60" cy="66" r="52" fill="url(#lsh)"/><path d="M28 50 L44 30 H76 L92 50 L60 104 Z" fill="url(#lss)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M28 50 H92 M44 30 L52 50 L60 104 L68 50 L76 30 M52 50 L60 30 L68 50" fill="none" stroke="#fff" stroke-width="2" opacity=".75" stroke-linejoin="round"/><rect x="40" y="112" width="40" height="14" rx="6" fill="#f7dfe3" stroke="#b49bb6" stroke-width="2"/><rect x="48" y="124" width="24" height="96" rx="11" fill="#fbeef0" stroke="#b49bb6" stroke-width="2"/><rect x="55" y="140" width="10" height="16" rx="4" fill="#c7d3ec"/></svg>`,
 and2ble:`<svg viewBox="0 0 120 230"><defs><radialGradient id="lsc" cx=".4" cy=".35"><stop offset="0" stop-color="#eaffd0"/><stop offset=".55" stop-color="#6dff9a"/><stop offset="1" stop-color="#22c55e"/></radialGradient></defs><g fill="url(#lsc)" stroke="#f2ffe8" stroke-width="3"><circle cx="60" cy="38" r="24"/><circle cx="60" cy="90" r="24"/><circle cx="34" cy="64" r="24"/><circle cx="86" cy="64" r="24"/></g><circle cx="60" cy="64" r="16" fill="#c6ff4d"/><path d="M60 64 Q70 92 64 112" stroke="#22c55e" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="40" y="112" width="40" height="14" rx="6" fill="#e7f7e9" stroke="#5fa873" stroke-width="2"/><rect x="48" y="124" width="24" height="96" rx="11" fill="#f2fbf3" stroke="#5fa873" stroke-width="2"/><rect x="55" y="140" width="10" height="16" rx="4" fill="#9fe7b4"/></svg>`};
LS.exo=`<img src="${ART.exo}" alt="">`;LS.svt=`<img src="${ART.svt}" alt="">`;
function avHTML(x,big){return x.id==='caleb'?`<span class="av${big?' big':''} pic"><img src="${ART.calebAv}" alt=""></span>`:`<span class="av${big?' big':''}">${esc(x.name[0])}</span>`}
const LS_GLOW={exo:'#eef1ff',svt:'#f4b9cd',and2ble:'#3dff7a'};
function stageGroup(){if(KPOP.includes(VIEW))return VIEW;if(VIEW==='bias'){const g=BIAS_GROUP[CUR_BIAS];if(KPOP.includes(g))return g}return null}
function applyStage(){const g=stageGroup();const b=document.body;b.classList.remove('stage','stage-exo','stage-svt','stage-and2ble');
  const lh=document.querySelector('#v-lads .hero');if(lh&&!lh.querySelector('.caleb-art')){const i=document.createElement('img');i.className='caleb-art';i.src=ART.calebHero;i.alt='';lh.appendChild(i)}
  if(!g)return;b.classList.add('stage','stage-'+g);
  if(VIEW==='and2ble')$('#k-name').innerHTML=`<img class="logo" src="${ART.andLogo}" alt="and2ble">`;
  const hero=document.querySelector(VIEW==='bias'?'#biasHero':'#v-kpop .hero');if(hero){let el=hero.querySelector('.ls');if(!el){el=document.createElement('div');el.className='ls';el.setAttribute('aria-hidden','true');hero.appendChild(el)}if(el.dataset.g!==g){const sfx=VIEW==='bias'?'b':'k';el.innerHTML=LS[g].replace(/id="(ls\w)"/g,'id="$1'+sfx+'"').replace(/url\(#(ls\w)\)/g,'url(#$1'+sfx+')');el.dataset.g=g}}}

/* ---------- journey map, programs, me ---------- */
const OUTFITS={dress:[
 {id:'pink',name:'Rose',lv:1,a:'#ffb3d1',b:'#ff7eb3'},
 {id:'blue',name:'Sky',lv:1,a:'#a9d6ff',b:'#5fa8f0'},
 {id:'lilac',name:'Lilac',lv:3,a:'#d9c6ff',b:'#a184f0'},
 {id:'mint',name:'Mint',lv:5,a:'#bff0d6',b:'#5cc79a'},
 {id:'starry',name:'Starry night',lv:8,a:'#33407a',b:'#ffd34d'}],
 hat:[{id:'crown',name:'Crown',lv:1},{id:'bow',name:'Big bow',lv:1},{id:'tiara',name:'Tiara',lv:2},{id:'none',name:'No hat',lv:1}]};
function outfit(){const o=S.game.outfit||{};return {dress:OUTFITS.dress.find(x=>x.id===o.dress)||OUTFITS.dress[0],hat:OUTFITS.hat.find(x=>x.id===o.hat)||OUTFITS.hat[0]}}
function petSVG(d,h){const o=outfit();d=d||o.dress;h=h||o.hat;
  const DRESS=`<path d="M26 88 Q60 112 94 88 L100 106 Q60 128 20 106Z" fill="${d.a}"/><path d="M20 106 Q30 112 40 108 Q50 114 60 110 Q70 114 80 108 Q90 112 100 106" fill="none" stroke="${d.b}" stroke-width="4" stroke-linecap="round"/>${d.id==='starry'?'<g fill="#ffd34d"><circle cx="40" cy="100" r="2"/><circle cx="58" cy="106" r="2.4"/><circle cx="78" cy="99" r="2"/></g>':'<g fill="#fff" opacity=".7"><circle cx="42" cy="99" r="2"/><circle cx="60" cy="104" r="2"/><circle cx="78" cy="99" r="2"/></g>'}<path d="M52 88l8 5 8-5-2 8-6-3-6 3z" fill="${d.b}"/>`;
  const HAT=h.id==='crown'?`<path d="M38 40 L42 18 L52 30 L60 12 L68 30 L78 18 L82 40 Z" fill="#ffd34d" stroke="#e8a92a" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="13" r="3.4" fill="${d.b}"/><circle cx="42" cy="18" r="2.6" fill="#b79cff"/><circle cx="78" cy="18" r="2.6" fill="#b79cff"/><circle cx="60" cy="33" r="4" fill="${d.b}"/>`:h.id==='bow'?`<g transform="translate(80 34) rotate(18)"><path d="M0 0 L-20 -12 L-20 12Z M0 0 L20 -12 L20 12Z" fill="${d.a}" stroke="${d.b}" stroke-width="3" stroke-linejoin="round"/><circle r="6" fill="${d.b}"/></g>`:h.id==='tiara'?`<path d="M40 38 Q60 22 80 38" fill="none" stroke="#ffd34d" stroke-width="5" stroke-linecap="round"/><path d="M52 31 L60 18 L68 31" fill="#ffd34d"/><circle cx="60" cy="25" r="3.6" fill="${d.b}"/><circle cx="46" cy="33" r="2.4" fill="#fff"/><circle cx="74" cy="33" r="2.4" fill="#fff"/>`:'';
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="108" rx="30" ry="6" fill="#000" opacity=".12"/><ellipse cx="44" cy="100" rx="10" ry="6" fill="#e2b58c"/><ellipse cx="76" cy="100" rx="10" ry="6" fill="#e2b58c"/>${HAT}<ellipse cx="60" cy="68" rx="38" ry="34" fill="#fde6c8"/>${DRESS}<ellipse cx="60" cy="78" rx="24" ry="18" fill="#fff4e4"/><g class="eyes"><circle cx="47" cy="62" r="4.6" fill="#3a2f2a"/><circle cx="73" cy="62" r="4.6" fill="#3a2f2a"/><circle cx="48.6" cy="60.4" r="1.5" fill="#fff"/><circle cx="74.6" cy="60.4" r="1.5" fill="#fff"/></g><ellipse cx="38" cy="72" rx="6" ry="3.6" fill="#f7a5a5" opacity=".75"/><ellipse cx="82" cy="72" rx="6" ry="3.6" fill="#f7a5a5" opacity=".75"/><path d="M55 70q2.5 3 5 0q2.5 3 5 0" stroke="#3a2f2a" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`}

const SCENE=`<svg class="sc-bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9b6f2"/><stop offset=".6" stop-color="#ffd6e7"/><stop offset="1" stop-color="#fff0f6"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky)"/>${[[40,30],[110,60],[300,24],[350,70],[220,40],[170,18]].map(([x,y],i)=>`<path transform="translate(${x} ${y}) scale(${.6+(i%3)*.25})" d="M0-8L2-2 8 0 2 2 0 8-2 2-8 0-2-2Z" fill="#fff" opacity=".9"/>`).join('')}<g fill="#fff" opacity=".9"><path d="M64 92c0-8 12-10 14-2 2-8 14-6 14 2 0 10-14 16-14 16s-14-6-14-16z"/><ellipse cx="320" cy="104" rx="26" ry="9"/><ellipse cx="336" cy="98" rx="15" ry="9"/></g><g transform="translate(200 186)"><rect x="-70" y="-60" width="140" height="70" fill="#ffe0ee"/><path d="M-70-60h140" stroke="#f3a6c8" stroke-width="4"/>${[-70,-44,-18,8,34,60].map(x=>`<rect x="${x}" y="-70" width="12" height="12" fill="#ffe0ee"/>`).join('')}<rect x="-100" y="-104" width="34" height="114" fill="#ffd0e5"/><rect x="66" y="-104" width="34" height="114" fill="#ffd0e5"/><rect x="-22" y="-128" width="44" height="80" fill="#ffd0e5"/><path d="M-106-104 L-83-152 L-60-104Z M60-104 L83-152 L106-104Z M-28-128 L0-184 L28-128Z" fill="#b79cff"/><path d="M-83-152v-14l12 5-12 5 M83-152v-14l12 5-12 5 M0-184v-16l14 6-14 6" stroke="#e8679a" stroke-width="2.5" fill="#ff7eb3"/><path d="M-16 10v-28a16 16 0 0 1 32 0v28Z" fill="#c98bb0"/>${[[-83,-80],[83,-80],[0,-100],[-40,-36],[40,-36]].map(([x,y])=>`<path d="M${x-6} ${y+10}v-8a6 6 0 0 1 12 0v8Z" fill="#fff6c8"/>`).join('')}</g><path d="M0 200 Q100 168 200 192 T400 186 V300 H0Z" fill="#f7b2cf"/><path d="M0 232 Q120 214 220 230 T400 224 V300 H0Z" fill="#f49cc0"/></svg>`;
function goalsToday(){const sc=S.school;const d=today();const done=new Set((sc.goalDone||{})[d]||[]);const ck=!!(S.game.checkins||{})[d];const foc=focusToday()>0;
  const custom=(sc.goals&&sc.goals.length?sc.goals:[{id:'g-water',e:'💧',text:'Drink a glass of water'},{id:'g-notes',e:'📓',text:"Review today's notes"},{id:'g-tidy',e:'✨',text:'Tidy one small thing'}]);
  return [{id:'auto-ck',e:'🌤️',text:'Daily check-in',xp:5,done:ck,auto:1},{id:'auto-focus',e:'🌱',text:'Grow a sprout (1 focus session)',xp:10,done:foc,auto:1},...custom.map(g=>({...g,xp:5,done:done.has(g.id)}))]}
function renderJourney(){const g=gameState();
  const run=fState&&!fState.paused;const r=fRemain();const p=fState?1-r/fLen():0;const L=16;
  $('#j-scene').innerHTML=SCENE+`<div class="sc-top"><span class="sc-lv">LV ${g.lv.L}</span><span class="sc-xp"><i style="width:${Math.round(g.lv.into/g.lv.need*100)}%"></i></span><span class="sc-st${g.s.streak?'':' cold'}">🔥 ${g.s.streak}</span></div><button class="pet pet-btn${run?' busy':''}" aria-label="Open Mochi's wardrobe">${petSVG()}${run?'<span class="pet-prop">📖</span>':''}</button><div class="pet-name">Princess Mochi ♡ <small>tap to dress up</small></div>`;
  const mm=Math.floor(r/60000),ss=Math.floor(r/1000)%60;
  $('#j-adv').innerHTML=`<div class="adv-top"><b>${run?'Studying':fState?'Taking a break':'Resting'}</b><span>${run?'back in '+mm+':'+String(ss).padStart(2,'0'):fState?'paused':'start a focus to study together'}</span></div><div class="adv-track"><span class="adv-ic">⚡</span>${Array.from({length:L},(_,i)=>i===Math.min(L-1,Math.floor(p*L))&&fState?`<span class="adv-me">${petSVG()}</span>`:`<i class="${i<p*L?'on':''}"></i>`).join('')}${fState?'':`<span class="adv-me">${petSVG()}</span>`}<span class="adv-end">🎁</span></div><div class="adv-btns"><button class="gbtn" id="adv-go">${run?'Pause':fState?'Resume':'Start '+(S.school.focusLen||25)+' min focus'}</button>${fState?'<button class="gbtn ghost" id="adv-stop">Stop</button>':''}</div>`;
  const gs=goalsToday();const left=gs.filter(x=>!x.done).length;
  $('#j-goalsT').textContent=left?`${left} goal${left===1?'':'s'} left for today!`:'All goals done today! 🎉';
  $('#j-goals').innerHTML=gs.map(x=>`<div class="goal${x.done?' done':''}"><span class="g-ic">${x.e}</span><b>${esc(x.text)}</b><span class="g-xp">${x.xp}<i>⚡</i></span>${x.auto?(x.done?`<span class="g-ck auto" aria-hidden="true">✓</span>`:x.id==='auto-ck'?`<button class="g-ck" data-checkin aria-label="Check in">✓</button>`:`<button class="g-ck" data-startfocus aria-label="Start a focus session">▶</button>`):`<button class="g-ck" data-goal="${x.id}" aria-pressed="${x.done}" aria-label="Done">✓</button>`}${x.auto?'':`<button class="g-del" data-goaldel="${x.id}" aria-label="Remove goal">×</button>`}</div>`).join('');
  $('#j-player').innerHTML=playerCard(false);
  const t=today();const sd=sitData();const dl=sd.cds.filter(c=>c.date>=t).sort((a,b)=>a.date.localeCompare(b.date))[0];const todo=sd.todos.filter(x=>!x.done).length;
  const qs=quests().filter(q=>!q.claimed);const sh=S.concerts.filter(r=>r.date>=t&&r.status!=='missed').sort((a,b)=>a.date.localeCompare(b.date))[0];
  $('#j-next').innerHTML=[
    qs[0]?`<button class="nx" data-view="game"><span>${qs[0].e}</span><b>${esc(qs[0].name)}</b><small>${qs[0].done?'Ready to claim!':Math.min(qs[0].p,qs[0].n)+' / '+qs[0].n}</small></button>`:'',
    (()=>{const n=nextClass();return n?`<button class="nx" data-view="school"><span>🎓</span><b>${esc(MOD_NAMES[n.m]||n.m)}</b><small>${esc(classWhen(n))} · ${esc(n.l)}</small></button>`:`<button class="nx" data-view="school"><span>📚</span><b>${dl?esc(dl.label):'School'}</b><small>${dl?(daysTo(dl.date)===0?'Due today':'in '+daysTo(dl.date)+' days'):todo?todo+' to-dos left':'Open School'}</small></button>`})(),
    sh?`<button class="nx" data-view="${sh.group}"><span>🎤</span><b>${esc(sh.tour)}</b><small>in ${daysTo(sh.date)} days</small></button>`:`<button class="nx" data-view="home"><span>🧸</span><b>Collect something</b><small>+8 XP per item</small></button>`].join('');
}
function progOf(id){if(id==='lads')return [CARDS.filter(c=>S.owned[c.id]).length,CARDS.length];if(id==='bias'){const a=BIASES.reduce((x,b)=>x+(b.id==='caleb'?CARDS.length:biasItems(b).length),0);return [0,a]}const l=KCOL[id]||[];return [l.filter(x=>S.kown[x.id]).length,l.length]}
function renderPrograms(){const P=[['lads','恋与深空 · Caleb','🍎'],['exo','EXO','🌙'],['svt','SEVENTEEN','💎'],['and2ble','and2ble','🍀'],['bias','My Biases','💗']];
  $('#h-programs').innerHTML=P.map(([id,n,e])=>{const [o,tot]=progOf(id);const pct=id==='bias'?null:Math.round(o/(tot||1)*100);const spent=id==='bias'?sumC('bias',S.bias):totalOf(id);
    return `<button class="prog f-${id==='bias'?'bias':id}${LS[id]?' lsc':''}" data-view="${id}" style="${LS[id]?'--g:'+LS_GLOW[id]:''}"><div class="pg-art"><span class="pg-pill">✓ ${pct===null?BIASES.length+' biases':pct+'% Complete'}</span>${id==='lads'?`<img class="pg-cal" src="${ART.calebHero}" alt="">`:''}${LS[id]?`<span class="pg-ls">${LS[id].replace(/id="(ls\w)"/g,'id="$1p"').replace(/url\(#(ls\w)\)/g,'url(#$1p)')}</span>`:(id==='lads'?'':`<span class="pg-e">${e}</span>`)}</div><div class="pg-b"><b>${esc(n)}</b><small>${id==='bias'?'Chanyeol · Baekhyun · Dokyeom · Gyuvin · Caleb':`Owned: ${o}/${tot}`} · ${fmt(spent)}</small></div></button>`}).join('');}
function renderWardrobe(){const o=outfit();const L=gameState().lv.L;
  $('#wd-stage').innerHTML=petSVG()+`<span>${esc(o.dress.name)} · ${esc(o.hat.name)}</span>`;
  $('#wd-dress').innerHTML=OUTFITS.dress.map(d=>{const lk=L<d.lv;return `<button class="wd${d.id===o.dress.id?' on':''}${lk?' lock':''}" data-dress="${d.id}" ${lk?'disabled':''} aria-pressed="${d.id===o.dress.id}"><span class="sw" style="background:${d.a};box-shadow:inset 0 -6px 0 ${d.b}"></span>${esc(d.name)}${lk?`<small>🔒 LV ${d.lv}</small>`:''}</button>`}).join('');
  $('#wd-hat').innerHTML=OUTFITS.hat.map(h=>{const lk=L<h.lv;return `<button class="wd${h.id===o.hat.id?' on':''}${lk?' lock':''}" data-hat="${h.id}" ${lk?'disabled':''} aria-pressed="${h.id===o.hat.id}"><span class="mini">${petSVG(o.dress,h)}</span>${esc(h.name)}${lk?`<small>🔒 LV ${h.lv}</small>`:''}</button>`}).join('')}
function renderMe(){renderWardrobe();const g=gameState();const sd=sitData();const t=today();
  $('#me-card').innerHTML=`<div class="me-av">JZ</div><div><b>Jin Ziyu</b><small>Robotics Systems · SIT</small><div class="me-chips"><span>LV ${g.lv.L} ${esc(g.title)}</span><span>🔥 ${g.s.streak}</span><span>🏆 ${g.un.length}</span></div></div>`;
  const dl=sd.cds.filter(c=>c.date>=t).sort((a,b)=>a.date.localeCompare(b.date));
  $('#me-sitstats').innerHTML=`<div><b>${sd.todos.filter(x=>!x.done).length}</b><small>to-dos left</small></div><div><b>${sd.focus}</b><small>focus sessions</small></div><div><b>${dl.length?daysTo(dl[0].date):'–'}</b><small>${dl.length?'days to '+esc(dl[0].label):'no deadlines'}</small></div>`;
}


/* ---------- school ---------- */
const MOD_COL={'RSE 3703':'#a9c8f5','RSE 4207':'#f5aabb','RSE 4501':'#a3e3bd','RSE 4804':'#f9d97a'};
const QUICK=[['IN4SIT','https://in4sit.singaporetech.edu.sg','🏫'],['xSITE','https://xsite.singaporetech.edu.sg','📘'],['Outlook','https://www.outlook.com/sit.singaporetech.edu.sg','📧'],['Library','https://libguides.singaporetech.edu.sg/az/databases','📚'],['Wayfinder','https://www.singaporetech.edu.sg/campus-wayfinder','🗺️'],['Room booking','https://rbs.singaporetech.edu.sg/','🗓️'],['Echo360','https://echo360.net.au/','🎬'],['Zoom','https://singaporetech.zoom.us/','🎥'],['Job portal','https://readytalent2.singaporetech.edu.sg/','💼']];
function saveSchool(){S.school={...S.school};if(S.mode==='db')queueDocWrite('meta/school',()=>S.school);else saveLocal()}
function schedule(){return (S.school.events&&S.school.events.length)?S.school.events:SCHED_DEFAULT}
function nowStr(){const d=new Date();return dstr(d)+'T'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function nextClass(){const n=nowStr();return schedule().find(e=>e.e>n)}
function hm(s){return s.slice(11,16)}
function classWhen(e){const n=nowStr();if(e.s<=n)return 'Now until '+hm(e.e);const dd=daysTo(e.s.slice(0,10));return (dd===0?'Today ':dd===1?'Tomorrow ':new Date(e.s.slice(0,10)+'T00:00').toLocaleDateString('en-SG',{weekday:'short',day:'numeric',month:'short'})+' · ')+hm(e.s)}
function allDeadlines(){const t=today();const q=schedule().filter(e=>e.k==='Quiz').map(e=>({id:'q'+e.s,label:e.m.replace('RSE ','')+' quiz',date:e.s.slice(0,10),auto:1}));return q.concat(S.school.deadlines||[]).filter(d=>d.date>=t).sort((a,b)=>a.date.localeCompare(b.date))}
let WK=0,SDAY=null;
function weekDays(){const d=new Date();d.setDate(d.getDate()-((d.getDay()+6)%7)+WK*7);return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return dstr(x)})}
function focusToday(){return (S.school.focus||{})[today()]||0}
function renderSchool(){
  const g=gameState();const n=nextClass();const h=new Date().getHours();
  $('#s-hello').innerHTML=`<div><small>${h<12?'Good morning':h<18?'Good afternoon':'Good evening'}</small><b>Ziyu ☀️</b></div><div class="sh-chips"><span>LV ${g.lv.L}</span><span>🌱 ${focusToday()} today</span></div>`;
  // garden plot: 16 tiles, sprouts for focus this week
  const wk=weekDays();const wkN=wk.reduce((a,d)=>a+((S.school.focus||{})[d]||0),0);const st=['🌱','🌿','🌷','🌻'];
  $('#s-plot').innerHTML=Array.from({length:16},(_,i)=>`<span class="tile${i<wkN?' grown':''}">${i<wkN?st[Math.min(3,Math.floor(i/4))]:''}</span>`).join('')+`<div class="plot-cap">${wkN}/16 grown this week</div>`;
  // now card
  if(n){const live=n.s<=nowStr();$('#s-now').innerHTML=`<div class="nc-dot" style="background:${MOD_COL[n.m]||'#ddd'}"></div><div class="nc-b"><small>${live?'IN CLASS NOW':'NEXT CLASS'}</small><b>${esc(MOD_NAMES[n.m]||n.m)} · ${esc(n.k)}</b><span>${esc(classWhen(n))}–${hm(n.e)} · ${esc(n.l)}${n.w?' · '+esc(n.w):''}</span></div>${n.l&&n.l!=='Online'?`<a class="btn sm" href="https://www.singaporetech.edu.sg/campus-wayfinder" target="_blank" rel="noopener">Find room</a>`:''}`}
  else $('#s-now').innerHTML=`<div class="nc-b"><small>NO MORE CLASSES</small><b>Term's done in this timetable 🎉</b><span>Upload a new .ics below when you get one.</span></div>`;
  // week
  const ev=schedule();const t=today();if(!SDAY||!wk.includes(SDAY))SDAY=wk.includes(t)?t:wk[0];
  $('#s-week').textContent=new Date(wk[0]+'T00:00').toLocaleDateString('en-SG',{day:'numeric',month:'short'})+' – '+new Date(wk[6]+'T00:00').toLocaleDateString('en-SG',{day:'numeric',month:'short'});
  $('#s-days').innerHTML=wk.map(d=>{const c=ev.filter(e=>e.s.startsWith(d)).length;const dt=new Date(d+'T00:00');return `<button class="day${d===SDAY?' on':''}${d===t?' today':''}" data-day="${d}"><small>${dt.toLocaleDateString('en-SG',{weekday:'short'})}</small><b>${dt.getDate()}</b><i>${c?'•'.repeat(Math.min(c,3)):''}</i></button>`}).join('');
  const dayEv=ev.filter(e=>e.s.startsWith(SDAY));const nw=nowStr();
  $('#s-classes').innerHTML=dayEv.length?dayEv.map(e=>`<div class="cls${e.e<nw?' past':''}${e.s<=nw&&e.e>nw?' live':''}" style="--mc:${MOD_COL[e.m]||'#ddd'}"><div class="cls-t"><b>${hm(e.s)}</b><small>${hm(e.e)}</small></div><div class="cls-b"><span class="cls-code">${esc(e.m)} · ${esc(e.k)}</span><b>${esc(MOD_NAMES[e.m]||e.m)}</b><small>📍 ${esc(e.l)}${e.w?' · '+esc(e.w):''}</small></div>${e.k==='Quiz'?'<span class="quiz">QUIZ</span>':''}</div>`).join(''):`<div class="empty">No classes on this day. Rest, collect, or grow your garden 🌱</div>`;
  // deadlines
  const dls=allDeadlines().slice(0,8);
  $('#s-dl').innerHTML=dls.length?dls.map(d=>{const n=daysTo(d.date);return `<div class="dl${n<=3?' hot':''}"><b class="num">${n===0?'!':n}</b><small>${n===0?'today':n===1?'day':'days'}</small><span>${esc(d.label)}</span>${d.auto?'':`<button class="x" data-dldel="${d.id}" aria-label="Remove">×</button>`}</div>`}).join(''):`<div class="empty">No deadlines coming up.</div>`;
  // todos
  const td=S.school.todos||[];
  $('#s-todos').innerHTML=td.length?[...td.filter(x=>!x.done),...td.filter(x=>x.done)].map(x=>`<div class="row td${x.done?' done':''}"><button class="ck" data-todo="${x.id}" aria-pressed="${!!x.done}" aria-label="Mark done">${x.done?'✓':''}</button><div class="t">${esc(x.text)}</div><span></span><button class="icon-btn" data-tododel="${x.id}">Delete</button></div>`).join(''):`<div class="empty" style="box-shadow:none!important;border:0!important">Nothing to do yet. Add a task below.</div>`;
  $('#s-links').innerHTML=QUICK.map(([n,u,e])=>`<a href="${u}" target="_blank" rel="noopener"><span>${e}</span>${esc(n)}</a>`).join('');
  drawFocus();
}
/* focus timer: end time kept in browser so it survives reloads */
const FKEY=LOCAL_KEY+':focus';let fState=null,fTick=null;
function loadF(){try{fState=JSON.parse(localStorage.getItem(FKEY)||'null')}catch(e){fState=null}}
function saveF(){try{localStorage.setItem(FKEY,JSON.stringify(fState))}catch(e){}}
function fLen(){return (+S.school.focusLen||25)*60000}
function fRemain(){if(!fState)return fLen();if(fState.paused)return fState.left;return Math.max(0,fState.end-Date.now())}
function drawFocus(){const r=fRemain();const m=Math.floor(r/60000),s=Math.floor(r/1000)%60;const el=$('#fx-time');if(!el)return;
  el.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('#fx-sub').textContent=(fState&&!fState.paused)?'GROWING…':fState?'PAUSED':(S.school.focusLen||25)+' MIN';
  $('#fx-bar').style.width=(100-r/fLen()*100)+'%';$('#fx-go').textContent=(fState&&!fState.paused)?'PAUSE':fState?'RESUME':'START';
  if(fState&&!fState.paused&&r<=0)finishFocus()}
function renderJourneyTick(){if(fRemain()<=0)return finishFocus();renderJourneyTick.n=(renderJourneyTick.n||0)+1;if(renderJourneyTick.n%2===0)renderJourney()}
function finishFocus(){fState=null;saveF();clearInterval(fTick);fTick=null;const d=today();S.school.focus={...(S.school.focus||{}),[d]:((S.school.focus||{})[d]||0)+1};saveSchool();toast('🌱 Focus done · +10 XP');render()}
function runTick(){clearInterval(fTick);fTick=setInterval(()=>{if(!fState||fState.paused){clearInterval(fTick);fTick=null;return}if(VIEW==='school')drawFocus();else if(VIEW==='journey'&&!document.querySelector('#lvlModal:not([hidden])'))renderJourneyTick();else if(fRemain()<=0)finishFocus()},500)}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.id==='fx-go'){if(!fState)fState={end:Date.now()+fLen()};else if(fState.paused)fState={end:Date.now()+fState.left};else fState={paused:1,left:fRemain()};saveF();if(!fState.paused)runTick();drawFocus();if(VIEW==='journey')renderJourney();return}
  if(b.dataset.dress||b.dataset.hat){S.game.outfit={...(S.game.outfit||{}),...(b.dataset.dress?{dress:b.dataset.dress}:{hat:b.dataset.hat})};saveGame();toast('Mochi loves it ♡');render();return}
  if(b.closest('.pet-btn')){go('me');setTimeout(()=>$('#wardrobe').scrollIntoView({behavior:'smooth'}),60);return}
  if(b.hasAttribute('data-startfocus')){if(!fState){$('#fx-go').click()}scrollTo({top:0,behavior:'smooth'});return}
  if(b.id==='adv-go'){$('#fx-go')?$('#fx-go').click():0;return}
  if(b.id==='adv-stop'){fState=null;saveF();render();return}
  if(b.dataset.goal){const d=today();const cur=new Set((S.school.goalDone||{})[d]||[]);const on=!cur.has(b.dataset.goal);on?cur.add(b.dataset.goal):cur.delete(b.dataset.goal);S.school.goalDone={...(S.school.goalDone||{}),[d]:[...cur]};saveSchool();if(on)toast('+5 ⚡ Nice!');render();return}
  if(b.dataset.goaldel){const base=S.school.goals&&S.school.goals.length?S.school.goals:goalsToday().filter(x=>!x.auto).map(({id,e,text})=>({id,e,text}));S.school.goals=base.filter(x=>x.id!==b.dataset.goaldel);if(!S.school.goals.length)S.school.goals=[{id:uid(),e:'🌸',text:'Do one kind thing for myself'}];saveSchool();render();return}
  if(b.id==='fx-reset'){fState=null;saveF();drawFocus();return}
  if(b.id==='fx-len'){if(fState)return toast('Reset the timer to change its length');const L=[15,25,45,60];S.school.focusLen=L[(L.indexOf(+S.school.focusLen||25)+1)%L.length];saveSchool();drawFocus();return}
  if(b.id==='wk-prev'){WK--;SDAY=null;renderSchool();return}if(b.id==='wk-next'){WK++;SDAY=null;renderSchool();return}
  if(b.dataset.day){SDAY=b.dataset.day;renderSchool();return}
  if(b.dataset.todo){S.school.todos=S.school.todos.map(x=>x.id===b.dataset.todo?{...x,done:!x.done}:x);saveSchool();render();return}
  if(b.dataset.tododel){if(!b.dataset.armed){b.dataset.armed=1;b.textContent='Sure?';return}S.school.todos=S.school.todos.filter(x=>x.id!==b.dataset.tododel);saveSchool();render();return}
  if(b.dataset.dldel){S.school.deadlines=(S.school.deadlines||[]).filter(x=>x.id!==b.dataset.dldel);saveSchool();render();return}
});
document.addEventListener('submit',e=>{
  if(e.target.id==='goal-form'){e.preventDefault();const v=$('#goal-in').value.trim();if(!v)return;const base=S.school.goals&&S.school.goals.length?S.school.goals:goalsToday().filter(x=>!x.auto).map(({id,e,text})=>({id,e,text}));const E=['🌸','🍵','🧘','📚','🚶','🎧','🍎','💤'];S.school.goals=[...base,{id:uid(),e:E[base.length%E.length],text:v}];$('#goal-in').value='';saveSchool();render();return}
  if(e.target.id==='todo-form'){e.preventDefault();const v=$('#todo-in').value.trim();if(!v)return;S.school.todos=[{id:uid(),text:v,done:false},...(S.school.todos||[])];$('#todo-in').value='';saveSchool();render()}
  if(e.target.id==='dl-form'){e.preventDefault();const n=$('#dl-name').value.trim(),d=$('#dl-date').value;if(!n||!d)return;S.school.deadlines=[...(S.school.deadlines||[]),{id:uid(),label:n,date:d}];$('#dl-name').value='';saveSchool();render()}
});
function parseICS(txt){txt=txt.replace(/\r/g,'').replace(/\n[ \t]/g,'');const out=[];const p2=n=>String(n).padStart(2,'0');
  const loc=v=>{const m=v.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)/);if(!m)return null;const d=m[7]?new Date(Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5])):new Date(+m[1],m[2]-1,+m[3],+m[4],+m[5]);return dstr(d)+'T'+p2(d.getHours())+':'+p2(d.getMinutes())};
  txt.split('BEGIN:VEVENT').slice(1).forEach(b=>{const g={};b.split('\n').forEach(l=>{const i=l.indexOf(':');if(i>0)g[l.slice(0,i).split(';')[0]]=l.slice(i+1)});
    const sum=(g.SUMMARY||'').replace(/\\,/g,',');const m=sum.match(/^([A-Z]{2,4} ?\d{3,4})\s*-\s*(.*?)\s*\((?:\w+ )?(\w+)\)\s*$/);const s=loc(g.DTSTART||''),e=loc(g.DTEND||'');if(!s||!e)return;
    const who=((g.DESCRIPTION||'').replace(/\\n/g,'\n').match(/Instructor\(s\): (.*)/)||[])[1]||'';
    if(m&&!MOD_NAMES[m[1]])MOD_NAMES[m[1]]=m[2];
    out.push({s,e,m:m?m[1]:sum,k:m?m[3]:'Class',l:(g.LOCATION||'').split('\\n')[0].replace(/\\,/g,','),w:who.replace(/\w\S*/g,w=>w[0]+w.slice(1).toLowerCase())})});
  return out.sort((a,b)=>a.s.localeCompare(b.s))}
document.addEventListener('change',e=>{if(e.target.id!=='ics-in')return;const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const ev=parseICS(String(r.result));if(!ev.length){$('#ics-msg').textContent='No classes found in that file.';return}S.school.events=ev;saveSchool();$('#ics-msg').textContent=`Loaded ${ev.length} classes ✓`;render()};r.readAsText(f);e.target.value=''});
loadF();if(fState&&!fState.paused)runTick();

/* ---------- settings ---------- */
function renderRates(){$('#rates').innerHTML=`<label class="f">Home currency<select id="r-home">${CURS.map(c=>`<option ${c===S.settings.home?'selected':''}>${c}</option>`).join('')}</select></label>`+CURS.filter(c=>c!=='SGD').map(c=>`<label class="f">1 ${c} = ? SGD<input type="number" step="any" min="0" id="r-${c}" value="${S.settings.rates[c]??DEFAULT_RATES[c]}"></label>`).join('')}
$('#saveRates').onclick=()=>{const r={SGD:1};CURS.filter(c=>c!=='SGD').forEach(c=>{const v=+$('#r-'+c).value;r[c]=v>0?v:DEFAULT_RATES[c]});S.settings={home:$('#r-home').value,rates:r};saveSettings();toast('Rates saved')};
$('#copyBackup').onclick=()=>{const t=$('#backup');navigator.clipboard.writeText(t.value).then(()=>toast('Backup copied'),()=>{t.select();toast('Selected. Press copy.')})};
$('#restoreBackup').onclick=async()=>{const b=$('#restoreBackup'),msg=$('#restoreMsg');let j;try{j=JSON.parse($('#backup').value)}catch(e){msg.textContent='That text is not a valid backup.';return}
  if(!b.dataset.armed){b.dataset.armed=1;b.textContent='Tap again to restore';msg.textContent='Entries with the same id will be replaced.';return}
  delete b.dataset.armed;b.textContent='Restore from text';for(const c of COLLS)for(const r of j[c]||[])await putRow(c,r);
  S.owned={...S.owned,...(j.owned||{})};S.kown={...S.kown,...(j.kown||{})};if(S.mode==='db'){queueDocWrite('meta/cards',()=>({owned:S.owned}));queueDocWrite('meta/kcol',()=>({owned:S.kown}))}else saveLocal();
  if(j.settings){S.settings={home:j.settings.home||'SGD',rates:{...DEFAULT_RATES,...j.settings.rates}};saveSettings();renderRates()}
  msg.textContent='Restored.';render()};

try{const s=JSON.parse(localStorage.getItem(LOCAL_KEY+':sub')||'null');if(s)Object.assign(SUB,s)}catch(e){}
try{const b=localStorage.getItem(LOCAL_KEY+':bias');if(BIAS_GROUP[b])CUR_BIAS=b}catch(e){}
let startView='home';try{const v=localStorage.getItem(LOCAL_KEY+':view');if(v&&(v==='home'||v==='settings'||v==='bias'||v==='game'||v==='me'||v==='school'||FANDOMS.some(f=>f.id===v)))startView=v}catch(e){}
renderRates();mountMascots();go(startView);initStore();

/* ---------- 发货 countdown (Deepspace merch) ---------- */
function addDaysISO(d,n){const x=new Date(d+'T00:00');x.setDate(x.getDate()+n);return dstr(x)}
// Items still waiting to ship: status "ordered" with a 发货 date set.
function shipWaiting(){return S.merch.filter(r=>r.shipBy&&(r.status||'ordered')==='ordered').sort((a,b)=>a.shipBy.localeCompare(b.shipBy))}
function shipLabel(r){const n=daysTo(r.shipBy);return n>1?`发货 in ${n} days`:n===1?'发货 tomorrow':n===0?'发货 today!':`${-n} day${n===-1?'':'s'} late`}
function shipPill(r){if(!r.shipBy||(r.status||'ordered')!=='ordered')return '';const n=daysTo(r.shipBy);return `<span class="pill${n<=3?' c':''}">📦 ${shipLabel(r)}</span>`}
function renderShipWait(){const el=$('#l-ship');if(!el)return;const xs=shipWaiting();
  el.hidden=!xs.length;if(!xs.length){el.innerHTML='';return}
  el.innerHTML=`<div class="ship-h"><b>📦 待发货 · Waiting to ship</b><span class="muted">${xs.length} item${xs.length===1?'':'s'}</span></div>`+xs.map(r=>{const n=daysTo(r.shipBy);
    return `<div class="ship-row"><span class="ship-n num${n<=3?' hot':''}">${n<0?'!':n}<small>${n<0?'late':n===1?'day':'days'}</small></span><div class="ship-t"><b>${esc(r.name)}${(+r.qty||1)>1?` ×${r.qty}`:''}</b><small>${esc(shipLabel(r))} · ${esc(prettyDate(r.shipBy))}${r.series?' · '+esc(r.series):''}</small></div><button class="btn" data-shipped="${r.id}">Shipped ✓</button></div>`}).join('')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-shipped]');if(!b)return;const r=S.merch.find(x=>x.id===b.dataset.shipped);if(!r)return;putRow('merch',{...r,status:'shipped'});toast('Marked as shipped 📦')});

/* Earliest thing logged for a fandom (purchase, concert, Bubble, or a card/photo marked owned). */
function firstLove(f){const ds=[];rowsOf(f).forEach(([c,rs])=>rs.forEach(r=>{if(r.date)ds.push(r.date)}));
  if(f==='lads')Object.values(S.owned||{}).forEach(d=>d&&ds.push(d));else Object.entries(S.kown||{}).forEach(([k,d])=>{if(d&&k.startsWith(f+'-'))ds.push(d)});
  return ds.filter(d=>/^\d{4}-\d{2}-\d{2}/.test(d)).sort()[0]||null}

/* Every dated thing in the tracker, for the Studio Timeline page. */
function timelineEvents(){const ev=[];const add=(date,f,kind,title,sub,amt,v)=>{if(date&&/^\d{4}-\d{2}-\d{2}/.test(date))ev.push({date:date.slice(0,10),fandom:f||null,kind,title:title||'',sub:sub||'',amount:amt?fmt(amt):null,href:'#/tracker/'+(v||f||'home')})};
  S.spend.forEach(r=>add(r.date,'lads','spend',SPEND_LABEL[r.type]||'In-game spend',r.note,home('spend',r)));
  S.merch.forEach(r=>{add(r.date,'lads','merch',r.name+((+r.qty||1)>1?' ×'+r.qty:''),[r.series,{shipped:'shipped',received:'received'}[r.status]].filter(Boolean).join(' · '),home('merch',r));
    if(r.shipBy&&(r.status||'ordered')==='ordered')add(r.shipBy,'lads','ship','发货 · '+r.name,r.series,null)});
  S.concerts.forEach(r=>add(r.date,r.group,'concert',r.tour,[r.venue,r.city,r.status==='attended'?'attended ♡':r.status==='missed'?"didn't go":''].filter(Boolean).join(' · '),home('concerts',r)));
  S.albums.forEach(r=>add(r.date,r.group,'album',r.title+((+r.qty||1)>1?' ×'+r.qty:''),[r.ver,r.pc&&('pulled '+r.pc)].filter(Boolean).join(' · '),home('albums',r)));
  S.kmerch.forEach(r=>add(r.date,r.group,'kmerch',r.item,KINDS[r.kind]||'',home('kmerch',r)));
  S.bubble.forEach(r=>add(r.date,r.group,'bubble','Bubble · '+r.member,(+r.months||1)+' month'+((+r.months||1)>1?'s':''),home('bubble',r)));
  S.bias.forEach(r=>{const b=BIASES.find(x=>x.id===r.bias);add(r.date,BIAS_GROUP[r.bias],'bias',r.item,(b?b.name+' · ':'')+(BIAS_KIND[r.kind]||''),home('bias',r),'bias')});
  Object.entries(S.owned||{}).forEach(([id,d])=>{const c=CARD_BY_ID[id];if(c)add(d,'lads','card',c.name,c.stars+'★ card',null)});
  Object.entries(S.kown||{}).forEach(([id,d])=>{const g=id.split('-')[0];const x=(KCOL[g]||[]).find(y=>y.id===id);if(x)add(d,g,'collect',x.name,[x.cat,x.sec].filter(Boolean).join(' · '),null)});
  return ev}

/* ---------- bridge for the Studio start page ---------- */
window.FQLegacy={get S(){return S},firstLove,timelineEvents,MOD_COL,schedule,nextClass,classWhen,hm,allDeadlines,MOD_NAMES,FANDOMS,FNAME,totalOf,fmt,today,daysTo,prettyDate,uid,saveSchool,shipWaiting,shipLabel,putRow,render:()=>render()};
try{window.dispatchEvent(new Event('fq-legacy-change'))}catch(e){}

