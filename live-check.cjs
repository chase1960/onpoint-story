const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const origin='http://127.0.0.1:8123',report=[];
async function request(body){const response=await fetch(origin+'/api/state',{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});const store=await response.json();assert.equal(response.status,200,store.error);return store;}
async function create(order){const before=await request();const after=await request({Action:'new',OrderID:order});const ids=Object.keys(after.Cases).filter(id=>!before.Cases[id]);assert.equal(ids.length,1);return ids[0];}
(async()=>{
 for(const sample of [
  {name:'退款进度',group:'查清楚',order:'DEMO-RAIL-001',text:'票退了，钱咋还没回来？帮我查查',expected:'answered'},
  {name:'已到账核对',group:'查清楚',order:'DEMO-RAIL-003',text:'我想核对一下退款进度',expected:'answered'},
  {name:'政策咨询',group:'查清楚',order:'DEMO-RAIL-001',text:'退票退款规则是什么，能保证什么时候到账吗？',expected:'answered'},
  {name:'确认后追踪',group:'办到位',order:'DEMO-RAIL-001',text:'票退了，钱咋还没回来？帮我查查',expected:'answered',track:true},
  {name:'人工同案续办',group:'办到位',order:'DEMO-RAIL-001',text:'转人工客服帮我查退款进度',expected:'handoff',human:true},
  {name:'投诉争议',group:'接得住',order:'DEMO-RAIL-001',text:'我要投诉退款并追究责任',expected:'handoff'},
  {name:'状态未知',group:'接得住',order:'DEMO-RAIL-004',text:'帮我看一下退票退款进度',expected:'handoff'},
  {name:'未开放发票',group:'接得住',order:'DEMO-RAIL-001',text:'火车票怎么开发票？能直接帮我开吗',expected:'handoff'}
 ]){
  const id=await create(sample.order);let store=await request({Action:'message',CaseID:id,Text:sample.text});
  assert.equal(store.Cases[id].State,sample.expected,sample.name);assert.equal(store.Cases[id].Receipt,'');
  if(sample.track)store=await request({Action:'request_tracking',CaseID:id});
  if(sample.human){store=await request({Action:'accept',CaseID:id});store=await request({Action:'human_prepare',CaseID:id});}
  if(sample.track||sample.human){
   assert.equal(store.Cases[id].State,'plan');const plan=store.Cases[id].Plans[0];
   const input={Action:'confirm',CaseID:id,PlanID:plan.ID,PlanToken:plan.Token,Confirmed:true};
   store=await request(input);const receipt=store.Cases[id].Receipt;assert.ok(receipt);
   assert.equal(store.Tasks[receipt].CaseID,id);assert.equal(store.Cases[id].QueryOrder.Payment,'PROCESSING');
   store=await request(input);assert.equal(store.Cases[id].Receipt,receipt);
  }
  report.push({category:sample.group,case:sample.name,caseID:id,state:store.Cases[id].State,evidence:store.Cases[id].Evidence.length,receipt:store.Cases[id].Receipt,status:'passed'});
 }
 fs.writeFileSync(path.join(__dirname,'live-verification.json'),JSON.stringify({api:origin+'/api/state',mode:'real_http_synthetic_orders',cases:report},null,2));
 console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
