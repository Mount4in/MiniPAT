"""
Statistics visualization script: read numeric data from data.txt and use seaborn to draw a distribution histogram.
This script is a standalone utility and should not run when the module is imported.
"""

import seaborn as sns
import matplotlib.pyplot as plt


def get_data():
    num_list = []
    with open("data.txt", "r") as f:
        lines = f.readlines()
        for line in lines:
            num_list.append(int(line))
    return num_list


if __name__ == '__main__':
    numbers = get_data()
    sns.set_style("darkgrid")
    sns.displot(numbers, bins=[0, 10000, 100000, 500000, 1000000, 5000000])
    plt.show()
