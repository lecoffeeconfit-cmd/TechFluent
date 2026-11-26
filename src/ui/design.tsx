import React, {createContext, useContext, useState, type ReactNode} from 'react';
import {Platform, Pressable, StyleSheet, Text, TextInput, View, type PressableProps, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import {groupFor, type GroupId} from '../content/model';

const light = {bg:'#F6F7FA',surface:'#FFFFFF',soft:'#F1F2F7',text:'#202139',sub:'#565B71',muted:'#62697D',line:'#DFE1EB',primary:'#5746CD',accent:'#6857DF',wash:'#EEEBFD',onAccent:'#FFFFFF',positive:'#127253',positiveBg:'#E1F3EA',warn:'#865016',warnBg:'#FFF1D7',dark:false};
const dark = {bg:'#151623',surface:'#202232',soft:'#2B2D40',text:'#F3F2FA',sub:'#C0C2D2',muted:'#ACB0C5',line:'#393C52',primary:'#BAB0FF',accent:'#6653CB',wash:'#35304F',onAccent:'#FFFFFF',positive:'#86DDB6',positiveBg:'#233E35',warn:'#F2CA8E',warnBg:'#473C2B',dark:true};
export const palettes={light,dark};
export const ThemeContext=createContext(light);
export const useTheme=()=>useContext(ThemeContext);
export function useTone(id:GroupId){const t=useTheme(),g=groupFor(id);return {ink:t.dark?g.tint:g.color,bg:t.dark?g.color+'52':g.tint};}
export const row:ViewStyle={flexDirection:'row',alignItems:'center',gap:12};
export const between:ViewStyle={...row,justifyContent:'space-between'};
export const flex:ViewStyle={flex:1,minWidth:0};
const iconPaths:Record<string,string>={
  code:'M8 7 3 12l5 5 M16 7l5 5-5 5 M14 5l-4 14',home:'m3 10 9-7 9 7v10h-6v-6H9v6H3z',
  book:'M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z M12 6v15',
  career:'M3 8h18v12H3z M8 8V5h8v3 M3 12q9 5 18 0 M10 13h4',chart:'M3 20h18 M6 16v-5 M12 16V7 M18 16V3',
  user:'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M4 21v-2a8 6 0 0 1 16 0v2',
  flame:'M13 2c1 6-5 7-3 11 2-1 3-3 4-5 7 7 5 13-2 13C4 21 2 15 6 10c0 4 2 4 3 4C6 8 12 7 13 2z',
  network:'M9 3h6v5H9z M3 16h6v5H3z M15 16h6v5h-6z M12 8v4 M6 16v-4h12v4',
  globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M3 12h18 M12 3c-5 5-5 13 0 18 5-5 5-13 0-18z',
  shield:'m12 2 8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5z M8.5 11.5l2.5 2.5 4.5-5',
  brain:'M12 5c-3-4-7-1-7 2-3 1-3 5-1 7-2 4 1 6 4 6 1 3 4 2 4-1V5z M12 6l3-2 3 2 M12 11h7 M12 16h5l2 3 M7 8v3l2 1 M5 16h3',
  cloud:'M7 19a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11z',
  database:'M4 6a8 3 0 1 0 16 0 8 3 0 0 0-16 0z M4 6v12a8 3 0 0 0 16 0V6 M4 12a8 3 0 0 0 16 0',
  monitor:'M3 4h18v13H3z M12 17v4 M8 21h8',branch:'M6 4v12 M6 16c0-6 12-1 12-9 M8 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0z M20 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  server:'M3 4h18v7H3z M3 14h18v7H3z M6 7.5h1 M6 17.5h1',layout:'M3 4h18v16H3z M3 9h18 M9 9v11',
  arrow:'M4 12h15 M13 6l6 6-6 6',back:'M20 12H5 M10 6l-6 6 6 6',right:'m9 5 7 7-7 7',down:'m6 9 6 6 6-6',
  play:'M7 4v16l13-8z',clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 6v6l4 2',check:'m4 12 5 5L20 6',
  layers:'m12 3 10 5-10 5L2 8z M3 12l9 5 9-5 M3 16l9 5 9-5',
  search:'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z M15 15l6 6',mark:'M6 3h12v18l-6-4-6 4z',
  message:'M3 4h18v13H9l-5 4v-4H3z M7 9h10 M7 12h6',target:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0z M12 12h.01',
  phone:'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M10 18h4',
  bulb:'M9 17c0-3-4-4-4-8a7 7 0 0 1 14 0c0 4-4 5-4 8z M9 20h6 M10 22h4',
  review:'M3 10a9 9 0 1 1 2 8 M3 4v6h6',settings:'M3 7h8m4 0h6 M3 17h2m4 0h12 M15 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0z M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  leaf:'M4 20c0-11 9-15 16-16 1 12-5 17-13 14 M4 20l11-10',lock:'M5 10h14v11H5z M8 10V7a4 4 0 1 1 8 0v3 M12 14v3',
  calendar:'M3 5h18v16H3z M7 3v5 M17 3v5 M3 10h18',close:'M5 5l14 14 M19 5 5 19',
  star:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',external:'M13 3h8v8 M21 3 10 14 M9 5H4v15h15v-6',
  clipboard:'M7 5H4v16h16V5h-3 M8 3h8v5H8z M8 12h8 M8 16h5',mail:'M3 5h18v14H3z m0 0 9 8 9-8',
};
export function Icon({name,size=22,color,width=1.8}:{name:string;size?:number;color?:string;width?:number}){
  const t=useTheme();return <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false} aria-hidden><Path d={iconPaths[name]??iconPaths.book} stroke={color??t.primary} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none"/></Svg>;
}
export function Tile({icon,group,size=44}:{icon?:string;group:GroupId;size?:number}){
  const c=useTone(group);return <View style={{width:size,height:size,borderRadius:size*.3,alignItems:'center',justifyContent:'center',backgroundColor:c.bg}}><Icon name={icon??groupFor(group).icon} color={c.ink} size={Math.round(size*.51)}/></View>;
}
export function Txt({children,kind='body',color,style,live}:{children:ReactNode;kind?:'display'|'title'|'h2'|'h3'|'body'|'small'|'meta'|'label'|'code';color?:string;style?:StyleProp<TextStyle>;live?:boolean}){
  const t=useTheme();
  const headings=['display','title','h2','h3'].includes(kind);
  const fonts:Record<typeof kind,TextStyle>={display:{fontSize:36,lineHeight:41,fontWeight:'700',letterSpacing:-1.6},title:{fontSize:32,lineHeight:39,fontWeight:'700',letterSpacing:-1.2},h2:{fontSize:21,lineHeight:28,fontWeight:'700',letterSpacing:-.55},h3:{fontSize:17,lineHeight:23,fontWeight:'600',letterSpacing:-.25},body:{fontSize:16,lineHeight:25},small:{fontSize:14,lineHeight:21},meta:{fontSize:12,lineHeight:18,fontWeight:'500'},label:{fontSize:12,lineHeight:17,fontWeight:'700',letterSpacing:1.05},code:{fontFamily:Platform.OS==='ios'?'Menlo':'monospace',fontSize:14,lineHeight:22}};
  return <Text accessibilityRole={headings?'header':undefined} accessibilityLiveRegion={live?'polite':undefined} style={[{color:color??(['small','meta'].includes(kind)?t.sub:t.text)},fonts[kind],style]}>{children}</Text>;
}
export function Tap({children,style,...props}:PressableProps & {children:ReactNode;style?:StyleProp<ViewStyle>}){
  const t=useTheme();return <Pressable accessibilityRole="button" {...props} style={({pressed,hovered,focused}:any)=>[style,hovered&&{opacity:.88},pressed&&{opacity:.7},focused&&Platform.OS==='web'&&({outlineColor:t.primary,outlineStyle:'solid',outlineWidth:2,outlineOffset:2} as ViewStyle),props.disabled&&{opacity:.5}]}>{children}</Pressable>;
}
export function Button({label,onPress,icon,variant='primary',disabled=false}:{label:string;onPress:()=>void;icon?:string;variant?:'primary'|'secondary'|'quiet';disabled?:boolean}){
  const t=useTheme(),fg=variant==='primary'?'#FFF':t.primary;return <Tap disabled={disabled} accessibilityLabel={label} onPress={onPress} style={{...row,gap:8,alignSelf:'flex-start',justifyContent:'center',minHeight:46,maxWidth:'100%',paddingHorizontal:variant==='quiet'?4:17,paddingVertical:9,borderRadius:13,backgroundColor:variant==='primary'?t.accent:variant==='secondary'?t.wash:'transparent'}}>{icon&&<Icon name={icon} color={fg} size={18}/>}<Txt kind="small" color={fg} style={{fontWeight:'700',flexShrink:1}}>{label}</Txt></Tap>;
}
export function Panel({children,style}:{children:ReactNode;style?:StyleProp<ViewStyle>}){
  const t=useTheme();return <View style={[{backgroundColor:t.surface,borderColor:t.line,borderWidth:1,borderRadius:20,padding:20,gap:12},style]}>{children}</View>;
}
export function Chips<T extends string>({values,selected,onSelect,label}:{values:readonly T[];selected:T|T[];onSelect:(s:T)=>void;label?:string}){
  const t=useTheme();return <View accessibilityLabel={label} style={{...row,gap:7,flexWrap:'wrap'}}>{values.map(v=>{const active=Array.isArray(selected)?selected.includes(v):selected===v;return <Tap key={v} accessibilityState={{selected:active}} onPress={()=>onSelect(v)} style={{...row,minHeight:44,gap:5,borderRadius:13,paddingHorizontal:13,paddingVertical:8,backgroundColor:active?t.wash:t.surface,borderWidth:1,borderColor:active?t.primary:t.line}}>{active&&<Icon name="check" size={14}/>}<Txt kind="small" color={active?t.primary:t.sub} style={{fontWeight:active?'700':'500'}}>{v}</Txt></Tap>;})}</View>;
}
export function Bar({pct,color,label}:{pct:number|null; color?:string; label:string}){
  const t=useTheme(),value=pct===null?{text:'Unassessed'}:{min:0,max:100,now:pct};
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={value}
    style={{height:6,borderRadius:5,overflow:'hidden',backgroundColor:t.soft}}>
    <View style={{height:'100%',borderRadius:5,width:(Math.max(0,Math.min(100,pct??0))+'%') as `${number}%`,backgroundColor:color??t.primary}}/>
  </View>;
}
export function Ring({pct}:{pct:number|null}){const r=35,C=2*Math.PI*r;return <Svg accessible={false} width={88} height={88} viewBox="0 0 90 90"><Circle cx="45" cy="45" r={r} stroke="#968BED" strokeWidth={6} fill="none"/>{!!pct&&<Circle cx="45" cy="45" r={r} stroke="white" strokeWidth={6} strokeDasharray={`${C*pct/100} ${C}`} rotation="-90" origin="45,45" strokeLinecap="round" fill="none"/>}<Path d={pct===100?'m31 45 9 9 19-21':'m29 44 11-6 11 4 9-11 M53 31h7v7 M30 55h30'} fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></Svg>;}
export function Field({label,...props}:TextInputProps&{label:string}){const t=useTheme();return <View style={{gap:6}}><Txt kind="small" style={{fontWeight:'600'}}>{label}</Txt><TextInput accessibilityLabel={label} placeholderTextColor={t.muted} {...props} style={[{borderWidth:1,borderColor:t.line,borderRadius:13,paddingHorizontal:14,minHeight:48,paddingVertical:11,color:t.text,backgroundColor:t.surface,fontSize:16,textAlignVertical:props.multiline?'top':'center'},props.multiline&&{minHeight:104},props.style]}/></View>;}
export function Rule(){const t=useTheme();return <View style={{height:StyleSheet.hairlineWidth,backgroundColor:t.line}}/>;}
export function LinkRow({title,detail,icon,onPress}:{title:string;detail?:string;icon?:string;onPress:()=>void}){const t=useTheme();return <Tap onPress={onPress} style={{...row,minHeight:52,paddingVertical:4}}>{icon&&<Icon name={icon}/>}<View style={flex}><Txt kind="h3">{title}</Txt>{detail&&<Txt kind="small">{detail}</Txt>}</View><Icon name="right" color={t.muted} size={16}/></Tap>;}
export function Section({title,action,onPress}:{title:string;action?:string;onPress?:()=>void}){return <View style={between}><Txt kind="h2" style={flex}>{title}</Txt>{action&&onPress&&<Button label={action} onPress={onPress} variant="quiet"/>}</View>;}

export function ExpandableList<T>({items,render}:{items:readonly T[];render:(item:T)=>ReactNode}){
  const [limit,setLimit]=useState(12);
  return <>{items.slice(0,limit).map(render)}{items.length>limit&&
    <Button label="Show more" variant="secondary" onPress={()=>setLimit(n=>n+12)}/>}</>;
}
