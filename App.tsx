import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,AppState,Platform,ScrollView,useColorScheme,useWindowDimensions,View} from 'react-native';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {cloud} from './src/services/cloud';
import {LearningProvider,useLearning} from './src/core/state';
import {Navigator,tabs,useNav,type Tab} from './src/core/navigation';
import type {GroupId} from './src/content/model';
import {CareersScreen,CareerScreen,InterviewScreen} from './src/screens/Careers';
import {DomainScreen,EncyclopediaScreen,HomeScreen,LearnScreen,PracticesScreen} from './src/screens/Library';
import {GuideScreen,PlacementScreen,ProfileScreen,SetupScreen} from './src/screens/Profile';
import {LessonScreen} from './src/screens/Lesson';
import {ProgressScreen} from './src/screens/Progress';
import {between,Button,flex,Icon,palettes,row,Tap,ThemeContext,Txt,useTheme} from './src/ui/design';

const tabIcons:Record<Tab,string>={Home:'home',Learn:'book',Careers:'career',Progress:'chart',Profile:'user'};
function Brand(){return <View style={{...row,gap:10}}><View style={{backgroundColor:'#5C4BCB',width:40,height:40,borderRadius:13,alignItems:'center',justifyContent:'center'}}><Icon name="code" color="white" size={24} width={2.3}/></View><Txt kind="h2">TechFluent</Txt></View>;}
function TabBar({wide}:{wide:boolean}){const t=useTheme(),{route,go}=useNav(),current=({Lesson:'Learn',Encyclopedia:'Learn',Domain:'Learn',Practices:'Learn',Interview:'Careers',Career:'Careers',Setup:'Profile',Placement:'Learn',Guide:'Learn'} as Record<string,string>)[route.page]??route.page;
  return <View accessibilityRole="tablist" style={wide?{gap:5}:{flexDirection:'row',paddingHorizontal:5,paddingVertical:4,backgroundColor:t.surface,borderTopColor:t.line,borderTopWidth:1}}>{tabs.map(tab=>{const active=tab===current;return <Tap key={tab} accessibilityRole="tab" accessibilityLabel={tab} accessibilityState={{selected:active}} onPress={()=>go({page:tab})} style={wide?{...row,paddingHorizontal:13,paddingVertical:12,minHeight:49,backgroundColor:active?t.wash:'transparent',borderRadius:12}:{flex:1,minHeight:52,alignItems:'center',justifyContent:'center',gap:2,borderRadius:10,backgroundColor:active?t.wash:'transparent'}}><Icon name={tabIcons[tab]} color={active?t.primary:t.muted} size={wide?21:20}/><Txt kind={wide?'small':'meta'} color={active?t.primary:t.sub} style={{fontWeight:active?'700':'500',textAlign:'center'}}>{tab}</Txt></Tap>;})}</View>;
}
function Content(){const {route:r}=useNav();switch(r.page){
  case 'Home':return <HomeScreen/>;case 'Learn':return <LearnScreen/>;case 'Careers':return <CareersScreen/>;case 'Progress':return <ProgressScreen/>;case 'Profile':return <ProfileScreen/>;
  case 'Domain':return <DomainScreen id={r.id as GroupId}/>;case 'Career':return <CareerScreen id={r.id!}/>;case 'Lesson':return <LessonScreen id={r.id!} initialSection={r.section} initialStep={r.step}/>;
  case 'Encyclopedia':return <EncyclopediaScreen/>;case 'Setup':return <SetupScreen/>;case 'Placement':return <PlacementScreen/>;
  case 'Practices':return <PracticesScreen/>;case 'Interview':return <InterviewScreen id={r.id} initialLevel={r.level}/>;case 'Guide':return <GuideScreen/>;
}}
function Shell(){const {model,ready,warning,blocked,retry,owner}=useLearning(),system=useColorScheme(),{width}=useWindowDimensions(),wide=width>=960,t=palettes[model.prefs.theme==='Dark'||(model.prefs.theme==='System'&&system==='dark')?'dark':'light'];
  const {route,go,back}=useNav(),ref=useRef<ScrollView>(null),detail=!tabs.some(x=>x===route.page);
  useEffect(()=>{ref.current?.scrollTo({y:0,animated:false});if(Platform.OS==='web')document.title=route.page+' · TechFluent';},[route]);
  return <ThemeContext.Provider value={t}><SafeAreaView style={{flex:1,backgroundColor:t.surface}}><View style={{flex:1,flexDirection:wide?'row':'column',backgroundColor:t.bg}}>
    {wide?<View style={{width:208,padding:18,paddingTop:32,gap:35,borderRightWidth:1,borderColor:t.line,backgroundColor:t.surface}}><Brand/><TabBar wide/><View style={{flex:1}}/><Button label="Encyclopedia" icon="search" variant="quiet" onPress={()=>go({page:'Encyclopedia'})}/><View style={{...row,gap:8}}><Icon name="lock" size={15} color={t.muted}/><Txt kind="meta">{owner==='guest'?'Guest workspace':'Personal workspace'}</Txt></View></View>:
    <View style={{...between,minHeight:60,paddingVertical:8,paddingHorizontal:17,backgroundColor:t.surface,borderBottomWidth:1,borderColor:t.line}}><Brand/><Tap accessibilityLabel="Open encyclopedia" onPress={()=>go({page:'Encyclopedia'})} style={{width:44,height:44,alignItems:'center',justifyContent:'center'}}><Icon name="search"/></Tap></View>}
    <View style={flex}><ScrollView ref={ref} keyboardShouldPersistTaps="handled" contentContainerStyle={{alignItems:'center',paddingHorizontal:wide?32:16,paddingTop:wide?32:21,paddingBottom:45}}><View style={{width:'100%',maxWidth:detail?830:1000,gap:wide?22:17}}>
    {detail&&<Button label="Back" icon="back" variant="quiet" onPress={back}/>}
    {warning&&<View style={{backgroundColor:t.warnBg,borderRadius:12,padding:12,gap:5}}><Txt kind="small" live>{warning}</Txt><Button label="Retry" onPress={retry} variant="quiet"/></View>}
    {ready?<Content key={[route.page,route.id,route.section,route.step,route.level].join('/')}/>:!blocked&&<ActivityIndicator accessibilityLabel="Opening learning record" color={t.primary}/>}</View></ScrollView></View>
    {!wide&&<TabBar wide={false}/>}</View></SafeAreaView></ThemeContext.Provider>;
}
export default function App(){const [owner,setOwner]=useState<string|null>(cloud?null:'guest');
  useEffect(()=>{if(!cloud)return;let live=true;
    const {data}=cloud.auth.onAuthStateChange((_event,session)=>{if(live)setOwner(session?.user.id??'guest');});
    cloud.auth.getSession().then(({data})=>{if(live)setOwner(data.session?.user.id??'guest');}).catch(()=>{if(live)setOwner('guest');});
    const lifecycle=AppState.addEventListener('change',s=>{if(s==='active')cloud!.auth.startAutoRefresh();else cloud!.auth.stopAutoRefresh();});
    return()=>{live=false;data.subscription.unsubscribe();lifecycle.remove();};
  },[]);
  return <SafeAreaProvider>{owner===null?<ActivityIndicator accessibilityLabel="Opening account"/>:<LearningProvider key={owner} owner={owner}><Navigator><Shell/></Navigator></LearningProvider>}</SafeAreaProvider>;
}
