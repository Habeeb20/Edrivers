import React from 'react'
import Hero from "../component/LandingPage/Hero"
import DriverCategoriesGrid from '../component/LandingPage/DriverCategories'
import DriverStatesGrid from '../component/LandingPage/DriverStateGrid'
import HireDriverHero from '../component/LandingPage/HireDriver'
import HeroSection from '../component/LandingPage/HeroSection'
import CoreServices from '../component/LandingPage/CoreService'
import DriverCategories from '../component/LandingPage/DriverCategoriesSection'
import DriverCategoryCarousel from '../component/LandingPage/Prices'
import WhyChooseUs from '../component/LandingPage/WhyChooseUs'
import VideoFeed from '../component/Videos'

const Home = () => {
  return (
    <>
    <Hero/>
    <DriverCategoriesGrid/>
    <DriverCategoryCarousel/>
    <DriverStatesGrid/>
    <WhyChooseUs/>
    <VideoFeed/>
    <DriverCategories/>
    <HireDriverHero/>
    <HeroSection />
    <CoreServices/>
    </>
  )
}

export default Home