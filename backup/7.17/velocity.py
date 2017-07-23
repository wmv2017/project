#!/usr/bin/python
# -*- coding:utf-8 -*-
import numpy as np
def velocity_vector_2pts(x1,y1,z1,x2,y2,z2):
    interval = 0.016
    pt1 = np.array([x1,y1,z1])
    pt2 = np.array([x2,y2,z2])
    vector = pt2 - pt1
    speed = (np.linalg.norm(vector)/interval)*0.01
    return vector,speed

def find_bounce(caculeted_c):
    index = 0
    min_z = caculeted_c[3][2]
    for i in range(0,caculeted_c.shape[0]):
        if caculeted_c[i][2] < min_z:
            min_z = caculeted_c[i][2]
            index = i

    # bef_index = caculeted_c[2].argsort()[:1]
    return index
    #, af_index

def speed_between(red):
    #red means caculted 3d array

    #remove the beginning and end point
    for i in range(1,red.shape[0]-2):
        vector_b, v_b = velocity_vector_2pts(red[i][0],red[i][1],red[i][2],red[i+1][0],red[i+1][1],red[i+1][2])
        print(red[i][2], v_b)
    return None
    # COR = 9.04846411504/10.2462802937
    # print(COR)

    # vector_b, v_b = velocity_vector_2pts(blue[i-1][0],blue[i-1][1],blue[i-1][2],blue[i][0],blue[i][1],blue[i][2])
    #
    # vector_a, v_a = velocity_vector_2pts(blue[i][0],blue[i][1],blue[i][2],blue[i+1][0],blue[i+1][1],blue[i+1][2])


def main():
    vector,dist = velocity_vector_2pts(1,1,1,2,2,2)
    print(vector)
    print('velocity is(m/s): ',dist)

if __name__ == '__main__':
    main()
