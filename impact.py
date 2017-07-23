#!/usr/bin/python
# -*- coding:utf-8 -*-

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium import webdriver
import time
#from caculatexyz import *
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt
from plot3d import *
from calculate_impact import *
from velocity import *
from pnp_withoutinitial import *
def scrape():
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

    out_file = open("test_impact.txt",'a')
    #### for 17th , find the impact point and then find the trajectory and projection
    svgdot = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > ellipse:nth-child(19)')
    cx = float(svgdot.get_attribute("cx"))
    cy = float(svgdot.get_attribute("cy"))
    print(cx,"%",cy,file = out_file)


    svgdot.click()
    driver.find_element_by_id("traj-view-0").click()
    time.sleep(1.8)
    traj_description = driver.find_element_by_css_selector('#traj-description')
    tra1_p = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(1)').get_attribute("d")
    tra1 = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(4)').get_attribute("d")


    driver.find_element_by_css_selector('#traj-view-1').click()
    time.sleep(1.8)
    # s_yellow_p = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(1)').get_attribute("d")
    s_tra1 = driver.find_element_by_css_selector('#graph > svg:nth-child(1) > path:nth-child(4)').get_attribute("d")
    print(traj_description.text+"\n"+tra1_p+"\n"+tra1+"\n"+s_tra1,file = out_file)


    yellow = caculate(tra1,tra1_p)
    index = find_bounce(yellow)
    fig = plt.figure()
    ax = plot_3d(fig,yellow,index-2,index+3,"r","o")
    impact_x,impact_y = caculate_impact_xy(cx,cy)

    ax.scatter(305-impact_x, impact_y, 0, c="b", marker="o")
    plt.show()
def main():

    in_file = open('test_impact.txt','r')
    line = in_file.readlines()
    tra1_p = line[2]
    tra1 = line[3]
    s_tra1 = line[4]
    cx = 136.03772760207966
    cy = 154.72995605315975
    yellow = caculate(tra1,tra1_p)
    print(yellow)
    index = find_bounce(yellow)




    #182.15153714  1621.29866979
    speed_between(yellow)

    # print(impact_x,1768-impact_y,0)
    # print(305-yellow[index][0], yellow[index][1],yellow[index][2])

    option = 2
    ###show whole points
    if option ==1:
        fig = plt.figure()
        ax = plot_3d(fig,yellow,0,yellow.shape[0],"r","o")
        impact_x,impact_y = caculate_impact_xy(cx,cy)
        ax.scatter(impact_x, 1768-impact_y, 0, c="b", marker="o")
        plt.show()
    elif option ==2:###show impact points
        fig = plt.figure()
        ax = plot_bounce_3d(fig,yellow,index-2,index+3,"g","o",index)
        ax.scatter(305-yellow[index][0], yellow[index][1], yellow[index][2], c='r', marker='o')
        impact_x,impact_y = caculate_impact_xy(cx,cy)
        ax.scatter(impact_x, 1768-impact_y, 0, c="b", marker="o")
        plt.show()
    else:
        pass
    '''
    121.46734815676591 1628.4883906820849 0
    122.848462865 1621.29866979 3.37145737285

    '''




    ###compare 3d project with ordinary
    # im = cv2.imread("slips.png")
    # size = im.shape
    #
    # #project to slip view
    # #result is 3d 121 1 2s
    # yellow_2d = project_to_slip(yellow,size)
    # s_yellow = process_ord_slip(s_tra1)
    # show_project_slip(yellow_2d,(0, 255, 255),im)   #opencv use BGR , inverse RGB
    #
    # #show ordinary slip's view
    # show_ord_slip(s_yellow,(0, 255, 255),im)
    #
    #
    # cv2.imshow("Output", im)
    # cv2.waitKey(0)


    ### show impact on the pitch
    # im = cv2.imread("pitch.png")
    # size = im.shape
    # plt.imshow(im)
    # plt.scatter(136, 155)
    # plt.show()



if __name__ == "__main__":
    main()
