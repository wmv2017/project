#!/usr/bin/python
# -*- coding:utf-8 -*-
import re
from caculatexyz import *
from pnp_withoutinitial import *
from velocity import *
from sklearn.metrics import mean_squared_error

def show_pic(yellow,blue,red,s_yellow,s_blue,s_red,im):

# the input should all be numpy array
#yellow ,blue should all be projected array, although it's 3d . it's a 2d plane

   #show projected slip's view
    show_project_slip(yellow,(0, 255, 255),im)   #opencv use BGR , inverse RGB
    show_project_slip(blue,(0, 0, 255),im)
    show_project_slip(red,(255, 0, 0),im)
    #show ordinary slip's view
    show_ord_slip(s_yellow,(0, 255, 255),im)
    show_ord_slip(s_blue,(0, 0, 255),im)
    show_ord_slip(s_red,(255, 0, 0),im)

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

    '''speed 52.6mph = 23.5143 m/s
     '''
    # caculate_errors(s_blue,blue_2d)
    bounce_index = find_bounce(red)
    error_blue = caculate_errors_2(s_blue, blue_2d)
    error_red = caculate_errors_2(s_red, red_2d)
    error_blue_2 = caculate_errors_1(s_blue, blue_2d)
    error_red_2 = caculate_errors_1(s_red, red_2d)
    print(error_blue,error_red)
    print(error_blue_2,error_red_2)
    '''        blue    red
    errors_1  594.0743785302091 711.3602487927068
    errors_2  19.2228252682 23.767594013

    '''

def caculate_errors_1(s_or,s_cacu):


    s_cacu = s_cacu.reshape(s_cacu.shape[0], 2)
    error = mean_squared_error(s_or, s_cacu)

    return error
def caculate_errors_2(s_or,s_cacu):
    s_cacu = s_cacu.reshape(s_cacu.shape[0], 2)
    error = 0.0
    for i in range(0,s_cacu.shape[0]):
        dist = math.sqrt((s_cacu[i][0] - s_or[i][0])**2 + (s_cacu[i][1] - s_or[i][1])**2)
        error += dist
    return error

    # show_pic(yellow_2d,blue_2d,red_2d,s_yellow,s_blue,s_red,im)


if __name__ == '__main__':
    main()
