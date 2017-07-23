#!/usr/bin/python
# -*- coding:utf-8 -*-
'''
just select the 3 lines in the initial page of 2016-1

'''
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium import webdriver
import time
from caculatexyz import *
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt
from pnp_withoutinitial import *


# global im
# global size




        #return x,y,z
'''
scrape the initial 3 lines from 2016-1-1. Both keeper's and slip's view.
'''
def main():

    driver = webdriver.Firefox()
    #driver = webdriver.PhantomJS()
    driver.get('http://dynamic.pulselive.com/dynamic/cricinfo/graphing/index.html?cgid=71069')
    driver.find_element_by_id("traj-view-0").click()


    time.sleep(5.4)
    k_yellow_p = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(1)').get_attribute("d")
    k_yellow = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(10)').get_attribute("d")
    k_blue_p = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(2)').get_attribute("d")
    k_bule = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(8)').get_attribute("d")
    k_red_p = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(3)').get_attribute("d")
    k_red = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(6)').get_attribute("d")

    driver.find_element_by_css_selector('#traj-view-1').click()
    time.sleep(5.3)
    # s_yellow_p = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(1)').get_attribute("d")
    s_yellow = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(10)').get_attribute("d")
    # s_blue_p = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(2)').get_attribute("d")
    s_blue = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(8)').get_attribute("d")
    # s_red_p = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(3)').get_attribute("d")
    s_red = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(6)').get_attribute("d")
#caculetd 3d coordinates
    yellow = caculate(k_yellow,k_yellow_p)
    blue = caculate(k_bule,k_blue_p)
    red = caculate(k_red,k_red_p)
    out_file = open('3_lines.txt','w')
    print(k_yellow_p+"\n"+k_yellow+"\n"+k_blue_p+"\n"+k_bule+"\n"+k_red_p+"\n"+k_red+"\n"+s_yellow+"\n"+s_blue+"\n"+s_red,file = out_file)
#project to 2d coordinates

    im = cv2.imread("slips.png");
    size = im.shape
    yellow = project_to_slip(yellow,size)
    blue = project_to_slip(blue,size)
    red = project_to_slip(red,size)

#show projected slip's view
    show_project_slip(yellow,(255,255,0),im)
    show_project_slip(blue,(0, 0, 255),im)
    show_project_slip(red,(255, 0, 0),im)
#show ordinary slip's view
    show_ord_slip(process_ord_slip(s_yellow),(255,255,0),im)
    show_ord_slip(process_ord_slip(s_blue),(0, 0, 255),im)
    show_ord_slip(process_ord_slip(s_red),(255, 0, 0),im)

    cv2.imshow("Output", im)
    cv2.waitKey(0)

if __name__ == "__main__":

    main()
