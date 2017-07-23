#!/usr/bin/python
# -*- coding:utf-8 -*-
'''
for one sepcific trajectory, check the numeber of points in keeper's and slip's view is the same.

'''
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium import webdriver
import time
import re
#from caculatexyz import *
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt


def caculate(trajectory,projection,index):

    M = caculateM()
    caculate_xyz(trajectory,projection,M,index)
        #return x,y,z


#def store(x,y,z):

# def draw():



def main():
    driver = webdriver.Firefox()
    #driver = webdriver.PhantomJS()
    driver.get('http://dynamic.pulselive.com/dynamic/cricinfo/graphing/index.html?cgid=71069')
    driver.find_element_by_id("traj-view-0").click()
    time.sleep(2)#without this, the click happens before the trajectories
    driver.find_element_by_id("carousel").find_element_by_class_name("speed-pitchmap").click()
    select = Select(driver.find_element_by_id("inningsSelect"))
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#inningsSelect > option:nth-child(1)")))
    select.select_by_visible_text("All")
    #sloved?? sometimes this error happens :selenium.common.exceptions.NoSuchElementException: Message: Could not locate element with visible text: All

    svgdot = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > ellipse:nth-child(17)')

    ###### get the number of elements
    svgdots = driver.find_element_by_css_selector('#graph > svg:nth-child(1)')
    #num_element = len(svgdots.find_elements_by_tag_name("ellipse"))
    x = 0
    num_trajectories = 0
    num = 1
    for x in range(9, 10):

        path = '#graph > svg:nth-child(1) > ellipse:nth-child(' + str(x) + ')'

        driver.find_element_by_id("carousel").find_element_by_class_name("speed-pitchmap").click()
        time.sleep(1)
        select = Select(driver.find_element_by_id("inningsSelect"))
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#inningsSelect > option:nth-child(1)")))
        select.select_by_visible_text("All")

        svgdot = driver.find_element_by_css_selector(path)
        svgdot.click()
        time.sleep(1.8)
        trajectories = driver.find_element_by_css_selector('#graph > svg:nth-child(1)')
        num_trajectories =len(trajectories.find_elements_by_tag_name("path"))
        if num_trajectories == 2:
            traj_description = driver.find_element_by_css_selector('#traj-description')

            tra1_p = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(1)')
            tra1 = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(4)')

            trajectory = re.sub('[M]', "", tra1.get_attribute("d"))# delete M
            trajectory = re.split('[L]', trajectory)
            print("num of tra1: ",len(trajectory))
            driver.find_element_by_css_selector('#traj-view-1').click()
            time.sleep(1.8)
            tra1_slip = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(4)')
            trajectory_slip = re.sub('[M]', "", tra1_slip.get_attribute("d"))# delete M
            trajectory_slip = re.split('[L]', trajectory_slip)
            print("num of tra1_slip: ",len(trajectory_slip))

            #caculate(tra1.get_attribute("d"),tra1_p.get_attribute("d"),num)
            num +=1
        else:
            continue


if __name__ == "__main__":
    main()
