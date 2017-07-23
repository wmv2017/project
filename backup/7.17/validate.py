#!/usr/bin/python
# -*- coding:utf-8 -*-
import re
from caculatexyz import *
from pnp_withoutinitial import *
from velocity import *
from sklearn.metrics import mean_squared_error
from plot3d import *

def show_pic(yellow,blue,red,s_yellow,s_blue,s_red,im):

# the input should all be numpy array
#yellow ,blue should all be projected array, although it's 3d . it's a 2d plane

   #show projected slip's view
    show_project_slip(yellow,(0, 255, 255),im)   #opencv use BGR , inverse RGB
    show_project_slip(blue,(255, 0, 0),im)
    show_project_slip(red,(0, 0, 255),im)
    #show ordinary slip's view
    show_ord_slip(s_yellow,(0, 255, 255),im)
    show_ord_slip(s_blue,(255, 0, 0),im)
    show_ord_slip(s_red,(0, 0, 255),im)

    cv2.imshow("Output", im)
    cv2.waitKey(0)



def main():
    in_file = open('3_lines.txt','r')
    line = in_file.readlines()
    k_yellow_p = line[0]
    k_yellow = line[1]
    k_blue_p = line[2]
    k_bule = line[3]
    k_red_p = line[4]
    k_red = line[5]
    s_yellow = line[6]
    s_blue = line[7]
    s_red = line[8]
#caculate 3d
    yellow = caculate(k_yellow,k_yellow_p)
    blue = caculate(k_bule,k_blue_p)
    red = caculate(k_red,k_red_p)
    im = cv2.imread("slips.png");
    size = im.shape

    #project to slip view
    #result is 3d 121 1 2s
    yellow_2d = project_to_slip(yellow,size)
    blue_2d = project_to_slip(blue,size)
    red_2d = project_to_slip(red,size)

    #ordinary slip view
    s_yellow = process_ord_slip(s_yellow)
    s_blue = process_ord_slip(s_blue)
    s_red = process_ord_slip(s_red)
    all_error(s_blue,blue_2d,s_red,red_2d)

    '''speed 52.6mph = 23.5143 m/s
     '''
    # caculate_errors(s_blue,blue_2d)

    # show_pic(yellow_2d,blue_2d,red_2d,s_yellow,s_blue,s_red,im)

    # change_near_bounce(red)
    speed_between(red)

    # bounce_index = find_bounce(red)
    '''
    blue
    13.1591053424 11.341716629
    7.60128745228 9.54562550941
    2.88119215742 1.43762043336
    3.34606162951 9.04846411504

    '''
    '''
    red
    10.3825163353 11.1468677677
    4.92643905362 3.33964614246
    3.28054487651 5.90924392407
    5.83015104553 8.42433433373
    '''
    # plot_3d(blue,bounce_index-2,bounce_index+3,"r","o")


def change_near_bounce(red):
    bounce_index = find_bounce(red)
    i = bounce_index

    print(red[bounce_index][2]) #3.28054487651
    print(red[bounce_index+1][2]) #5.83015104553
    print(velocity_vector_2pts(red[i-1][0],red[i-1][1],red[i-1][2],red[i][0],red[i][1],red[i][2])[1])
    print(velocity_vector_2pts(red[i][0],red[i][1],red[i][2],red[i+1][0],red[i+1][1],red[i+1][2])[1])
    # speed_between(red)

    return None



def all_error(s_blue,blue_2d,s_red,red_2d):
    #print error
    error_blue = caculate_errors_2(s_blue, blue_2d)
    error_red = caculate_errors_2(s_red, red_2d)
    error_blue_2 = caculate_errors_1(s_blue, blue_2d)
    error_red_2 = caculate_errors_1(s_red, red_2d)
    print(error_blue,error_red)
    print(error_blue_2,error_red_2)
    print(avg_percent_error(s_blue, blue_2d))
    print(avg_percent_error(s_red, red_2d))
    '''        blue    red
    errors_1  594.0743785302091 711.3602487927068
    errors_2  19.2228252682 23.767594013

    '''
#mean_squared_error
def caculate_errors_1(s_or,s_cacu):


    s_cacu = s_cacu.reshape(s_cacu.shape[0], 2)
    error = mean_squared_error(s_or, s_cacu)
    return error
###total distance
def caculate_errors_2(s_or,s_cacu):
    s_cacu = s_cacu.reshape(s_cacu.shape[0], 2)
    error = 0.0
    for i in range(0,s_cacu.shape[0]):
        dist = math.sqrt((s_cacu[i][0] - s_or[i][0])**2 + (s_cacu[i][1] - s_or[i][1])**2)
        error += dist
    return error
#avg_percent_error , depends on the distance
def avg_percent_error(s_or,s_cacu):
    s_cacu = s_cacu.reshape(s_cacu.shape[0], 2)
    error_total = 0.0
    for i in range(0,s_cacu.shape[0]):
        dist = math.sqrt((s_cacu[i][0] - s_or[i][0])**2 + (s_cacu[i][1] - s_or[i][1])**2)
        error = dist/math.sqrt((s_or[i][0])**2 + (s_or[i][1])**2)
        error_total += error
    return error_total/s_cacu.shape[0]*100


if __name__ == '__main__':
    main()
