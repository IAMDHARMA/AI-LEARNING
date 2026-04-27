def decor(fun):
    def decor_1():
        print("it started")
        fun()
        print("ended")
    return decor_1

@decor
def try_1():
    print('mid')

try_1()