import { useState } from "react"

/*  
    Global variables
*/
type ScrollClassObj = {[key: string]: string}
const presetScrollClasses: ScrollClassObj = {
    "fadeInLeft": "fadeInLeft",
    "fadeInRight": "fadeInRight",
    "fadeInBottom": "fadeInBottom",
    "fadeInTop": "fadeInTop",
    "elementSeriesScroll": "elementSeries"
}
const presetAnimDuration = "1.5s"
const presetStayDuration = "1s"


let activeObservers: {[key: string]: IntersectionObserver} = {}

export const useSpecialClassHandler = (scrollClasses?: ScrollClassObj) => {
    let temp = presetScrollClasses
    if (scrollClasses) {
        Object.keys(scrollClasses).forEach(c => {
            temp[c] = scrollClasses[c]
        })
    }

    useState(() => {
        setTimeout(() => {refresh(temp)}, 100)
    })
}

const refresh = (scrollClasses: ScrollClassObj) => {
    refreshObservers(scrollClasses)
    refreshElemSeries()
}


/*
    Scroll animations
    - Adds a CSS class with an animation when the element comes into view
    - Only applies to elements in the scrollClasses array
    - Sets every elements opacity to 0 at the beginning
*/
const getObserver = (className: string) => {
    return new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("animationStart")
            entry.target.classList.add(className)
            refreshElemSeries()
          }
        })
      })
}

const refreshObservers = (classes: ScrollClassObj) => {
    const keys = Object.keys(classes)
    keys.forEach((className: string) => {
        if (!activeObservers[className]) {activeObservers[className] = getObserver(classes[className])}

        let observer = activeObservers[className]

        const elements: Element[] = Array.from(document.getElementsByClassName(className))

        elements.forEach((e: Element) => {
            e.classList.remove(className);
            e.classList.add("animationStart");
            observer.observe(e)
        })

    })
}


/*
    Element series
    - customizable using inline CSS VARIABLES
    -- duration: the delay between the in and out animations (1s by default (defaultStayDuration variable))
    -- in-duration: duration of the in animation (1.5s by default (defaultAnimDuration variable))
    -- out-duration: duration of the out animation (1.5s by default (defaultAnimDuration variable))
    -- overflow: how many seconds earlier does the next animation start (WILL ONLY APPLY IF IT DOESNT CAUSE OTHER VALUES TO BE NEGATIVE)
    -- when any of these variables are applied to the parent, they are automatically applied to its children, 
        unless the child has another value specified

    - Adding the "handled" class to the parent disables the animation altogether
    - Adding the "stay" class to a child disables the out animation for that child
    - addign the "skip" class to a child disables the animation for that child //TODO: Implement
*/
const refreshElemSeries = () => {
    const elemSeriess: HTMLElement[] = Array.from(document.getElementsByClassName("elementSeries")) as HTMLElement[] //jesus christ what is this
    if (elemSeriess) {
        elemSeriess.forEach(e => {
            if (e.classList.contains("handled")) {return}
            handleElemSeries(e)
        });
    }
}

const handleElemSeries = (series: HTMLElement) => {
    const parentStyle = series.style
    const children: HTMLElement[] = Array.from(series.children) as HTMLElement[]

    let totalDuration: number = secondToNum(parentStyle.getPropertyValue("--delay")) || 0.1;

    const defaultStayDuration = parentStyle.getPropertyValue("--duration") || presetStayDuration
    const defaultInDuration = parentStyle.getPropertyValue("--in-duration") || presetAnimDuration
    const defaultOutDuration = parentStyle.getPropertyValue("--out-duration") || presetAnimDuration
    const overflow = 0 || secondToNum(parentStyle.getPropertyValue("--overflow"))

    children.forEach(child => {
        const style = child.style

        style.setProperty("--delay-in",secondStr(totalDuration))

        totalDuration += secondToNum(style.getPropertyValue("--in-duration") || defaultInDuration) + secondToNum(style.getPropertyValue("--duration") || defaultStayDuration)
        if (overflow && overflow < totalDuration) {
            totalDuration -= overflow
        }

        style.setProperty("--delay-out",secondStr(totalDuration))

        if (!child.classList.contains("stay")) {totalDuration += (secondToNum(style.getPropertyValue("--out-duration") || defaultOutDuration))}
    })

    series.classList.add("handled")
}


/*
    Miscelaneous
*/
const secondStr = (num: number) => {
    return num.toString() + "s"
}

const secondToNum = (str: string) => {
    return Number(str.replace("s",""))
}