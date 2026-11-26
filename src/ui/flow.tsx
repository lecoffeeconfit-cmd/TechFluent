import React,{useEffect,useState} from 'react';
import {AccessibilityInfo,Animated,useWindowDimensions,View} from 'react-native';
import {useLearning} from '../core/state';
import {type Lesson} from '../content/model';
import {between,Button,Icon,row,Tap,Txt,useTheme} from './design';
const flows={
  internet:{names:['Your device','Router','Web server'],icons:['phone','network','server'],steps:['Your browser prepares a request for a page.','Routers forward the request toward the web server.','The server responds and the browser can display the page.']},
  dns:{names:['Browser','Resolver','DNS server'],icons:['globe','network','server'],steps:['Your browser needs an address for the site name.','The resolver looks in its cache. On a miss, it asks DNS servers for records.','The resolver returns an address. The browser can now connect.']},
  http:{names:['Client','HTTP','Server'],icons:['phone','layers','server'],steps:['The client chooses a method and a target.','The request reaches the server using the agreed message format.','The response carries a status and may include a body.']},
  api:{names:['Your app','API contract','Server'],icons:['phone','code','server'],steps:['Your weather app prepares the city input the API expects.','The server receives the request and handles it according to the API contract.','The app checks the response and displays the temperature with its unit.']},
};
export function Flow({kind}:{kind:NonNullable<Lesson['diagram']>}){
  const t=useTheme(),{model}=useLearning(),[step,set]=useState(0),flow=flows[kind],{width}=useWindowDimensions(),tiny=width<405;
  const [alpha]=useState(()=>new Animated.Value(1));
  const [systemReduced,reduced]=useState(true);
  useEffect(()=>{let live=true;AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(live)reduced(v);}).catch(()=>{});const s=AccessibilityInfo.addEventListener('reduceMotionChanged',reduced);return()=>{live=false;s.remove();};},[]);
  useEffect(()=>{if(model.prefs.reduceMotion||systemReduced){alpha.setValue(1);return;}alpha.setValue(.6);const animation=Animated.timing(alpha,{toValue:1,duration:200,useNativeDriver:false});animation.start();return()=>animation.stop();},[step,alpha,systemReduced,model.prefs.reduceMotion]);
  return <View style={{backgroundColor:t.soft,borderRadius:18,padding:tiny?12:20,gap:13}}><View style={between}><Txt kind="h3">Trace the exchange</Txt><Txt kind="meta">{step+1} / 3</Txt></View><View style={{...row,gap:tiny?2:7,alignItems:'center',justifyContent:'center',paddingVertical:7}}>{flow.names.map((n,i)=>{
    const ink=t.dark?['#A6CAFF','#C8B7FF','#92E3BF'][i]:['#275ABA','#6147BC','#11734F'][i],bg=t.dark?['#263C57','#393052','#264337'][i]:['#E1ECFF','#ECE6FF','#DAF3E7'][i];
    return <React.Fragment key={n}>{i>0&&<View style={{alignItems:'center',width:tiny?16:26}}><Txt color={t.primary} style={{fontWeight:'700'}}>→</Txt><Txt color={t.positive} style={{fontWeight:'700'}}>←</Txt></View>}<Tap onPress={()=>set(i)} accessibilityLabel={`Step ${i+1}, ${n}`} accessibilityState={{selected:i===step}} style={{flex:1,alignItems:'center',justifyContent:'center',minHeight:tiny?92:108,padding:5,borderRadius:15,backgroundColor:bg,borderColor:i===step?ink:'transparent',borderWidth:2,gap:5}}><Icon name={flow.icons[i]} color={ink} size={tiny?23:29}/><Txt kind="meta" color={ink} style={{textAlign:'center',fontWeight:'700'}}>{n}</Txt></Tap></React.Fragment>;})}</View><Animated.View style={{opacity:alpha}}><Txt kind="small" live>{flow.steps[step]}</Txt></Animated.View><Button label={step===2?'Replay exchange':step===0?'Send request':'Receive response'} icon={step===2?'review':'arrow'} variant="secondary" onPress={()=>set((step+1)%3)}/></View>;
}
