'use client';
import {Children, Fragment, cloneElement, createContext, isValidElement, useContext, useEffect, useState} from 'react';
import {translate} from '../lib/language.mjs';

const Locale=createContext('pt');
export const useLocale=()=>useContext(Locale);

export function LanguageProvider({children}){
 const [locale,setLocale]=useState('pt');
 useEffect(()=>{try{if(localStorage.getItem('atlas-language')==='en')setLocale('en');}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=locale==='en'?'en':'pt-BR';},[locale]);
 function choose(value){setLocale(value);try{localStorage.setItem('atlas-language',value);}catch{}}
 return <Locale.Provider value={locale}><div className="language-dock" role="group" aria-label={locale==='en'?'Language':'Idioma'}>
  {['pt','en'].map((code,i)=><button key={code} lang={code} aria-pressed={locale===code} onClick={()=>choose(code)}>{['Português','English'][i]}</button>)}
 </div>{children}</Locale.Provider>;
}

// Translate the presentation tree without modifying source data, input values, or callbacks.
function display(node){
 if(typeof node==='string')return translate(node);
 if(Array.isArray(node))return node.map(display);
 if(!isValidElement(node))return node;
 if(typeof node.type!=='string'&&node.type!==Fragment)return node;
 if(['pre','code','script','style'].includes(node.type)||node.props.translate==='no')return node;
 const props={};
 for(const key of ['aria-label','alt','title','placeholder']){
  if(typeof node.props[key]==='string')props[key]=translate(node.props[key]);
 }
 if(node.type==='option'&&node.props.value==null){
  const text=Children.toArray(node.props.children).join('');
  props.value=text;
 }
 if(node.props.children!=null)props.children=display(node.props.children);
 return cloneElement(node,props);
}
export function Localized({children}){return useLocale()==='en'?display(children):children;}
