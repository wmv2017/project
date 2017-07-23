#!/usr/bin/python
# -*- coding:utf-8 -*-
import re
from caculatexyz import *
from pnp_withoutinitial import *
from velocity import *


def show_pic(yellow,blue,red,s_yellow,s_blue,s_red,im):

# the input should all be numpy array'''
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

def error_message():
    return None

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
# all 2d numpy array
    yellow_2d = project_to_slip(yellow,size)
    blue_2d = project_to_slip(blue,size)
    red_2d = project_to_slip(red,size)
    s_yellow = process_ord_slip(s_yellow)
    s_blue = process_ord_slip(s_blue)
    s_red = process_ord_slip(s_red)

    '''speed 52.6mph = 23.5143 m/s
     '''
    bounce_index = find_bounce(red)
    # red[bounce_index][2] = 0.0
    for i in range(0,red.shape[0]-1):
        vector_b, v_b = velocity_vector_2pts(red[i][0],red[i][1],red[i][2],red[i+1][0],red[i+1][1],red[i+1][2])


        print(red[i][2], v_b)
    # COR = 9.04846411504/10.2462802937
    # print(COR)

    # vector_b, v_b = velocity_vector_2pts(blue[i-1][0],blue[i-1][1],blue[i-1][2],blue[i][0],blue[i][1],blue[i][2])
    #
    # vector_a, v_a = velocity_vector_2pts(blue[i][0],blue[i][1],blue[i][2],blue[i+1][0],blue[i+1][1],blue[i+1][2])





    # show_pic(yellow_2d,blue_2d,red_2d,s_yellow,s_blue,s_red,im)


if __name__ == '__main__':
    main()


'''
k_yellow_p+"\n"+k_yellow+"\n"+k_blue_p+"\n"+k_bule+"\n"+k_red_p+"\n"+k_red+"\n"+s_yellow+"\n"+s_bule+"\n"+s_red,
220 k_yellow_p
222 k_yellow
216 k_blue_p
216 k_bule
230 k_red_p
230 k_red
222 s_yellow
216 s_bule
230 s_red
'''
