PGDMP     ;    %                |         	   Ecommerce    15.4    15.4                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    41238 	   Ecommerce    DATABASE     �   CREATE DATABASE "Ecommerce" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Portuguese_Brazil.1252';
    DROP DATABASE "Ecommerce";
                postgres    false            �            1259    41240    clientes    TABLE       CREATE TABLE public.clientes (
    id_cliente integer NOT NULL,
    nome character varying(100) NOT NULL,
    senha character varying(100) NOT NULL,
    email character varying(100),
    endereco character varying(255) NOT NULL,
    telefone character varying(15)
);
    DROP TABLE public.clientes;
       public         heap    postgres    false            �            1259    41239    clientes_id_cliente_seq    SEQUENCE     �   CREATE SEQUENCE public.clientes_id_cliente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.clientes_id_cliente_seq;
       public          postgres    false    215                       0    0    clientes_id_cliente_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.clientes_id_cliente_seq OWNED BY public.clientes.id_cliente;
          public          postgres    false    214            �            1259    41263    itenspedidos    TABLE     �   CREATE TABLE public.itenspedidos (
    id_pedido integer NOT NULL,
    id_produto character varying(24) NOT NULL,
    quantidade integer NOT NULL,
    valor_unitario numeric(10,2) NOT NULL,
    valor_total numeric(10,2) NOT NULL
);
     DROP TABLE public.itenspedidos;
       public         heap    postgres    false            �            1259    41251    pedidos    TABLE     �   CREATE TABLE public.pedidos (
    id_pedido integer NOT NULL,
    id_cliente integer NOT NULL,
    valor_total numeric(10,2) NOT NULL,
    data timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metodo_pagamento character varying(50)
);
    DROP TABLE public.pedidos;
       public         heap    postgres    false            �            1259    41250    pedidos_id_pedido_seq    SEQUENCE     �   CREATE SEQUENCE public.pedidos_id_pedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.pedidos_id_pedido_seq;
       public          postgres    false    217                       0    0    pedidos_id_pedido_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.pedidos_id_pedido_seq OWNED BY public.pedidos.id_pedido;
          public          postgres    false    216            n           2604    41243    clientes id_cliente    DEFAULT     z   ALTER TABLE ONLY public.clientes ALTER COLUMN id_cliente SET DEFAULT nextval('public.clientes_id_cliente_seq'::regclass);
 B   ALTER TABLE public.clientes ALTER COLUMN id_cliente DROP DEFAULT;
       public          postgres    false    214    215    215            o           2604    41254    pedidos id_pedido    DEFAULT     v   ALTER TABLE ONLY public.pedidos ALTER COLUMN id_pedido SET DEFAULT nextval('public.pedidos_id_pedido_seq'::regclass);
 @   ALTER TABLE public.pedidos ALTER COLUMN id_pedido DROP DEFAULT;
       public          postgres    false    216    217    217            
          0    41240    clientes 
   TABLE DATA           V   COPY public.clientes (id_cliente, nome, senha, email, endereco, telefone) FROM stdin;
    public          postgres    false    215   �                 0    41263    itenspedidos 
   TABLE DATA           f   COPY public.itenspedidos (id_pedido, id_produto, quantidade, valor_unitario, valor_total) FROM stdin;
    public          postgres    false    218   �                 0    41251    pedidos 
   TABLE DATA           ]   COPY public.pedidos (id_pedido, id_cliente, valor_total, data, metodo_pagamento) FROM stdin;
    public          postgres    false    217   
                  0    0    clientes_id_cliente_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.clientes_id_cliente_seq', 5, true);
          public          postgres    false    214                       0    0    pedidos_id_pedido_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.pedidos_id_pedido_seq', 7, true);
          public          postgres    false    216            r           2606    41247    clientes clientes_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente);
 @   ALTER TABLE ONLY public.clientes DROP CONSTRAINT clientes_pkey;
       public            postgres    false    215            t           2606    41249    clientes email_unique 
   CONSTRAINT     Q   ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT email_unique UNIQUE (email);
 ?   ALTER TABLE ONLY public.clientes DROP CONSTRAINT email_unique;
       public            postgres    false    215            x           2606    41267    itenspedidos itenspedidos_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public.itenspedidos
    ADD CONSTRAINT itenspedidos_pkey PRIMARY KEY (id_pedido, id_produto);
 H   ALTER TABLE ONLY public.itenspedidos DROP CONSTRAINT itenspedidos_pkey;
       public            postgres    false    218    218            v           2606    41257    pedidos pedidos_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id_pedido);
 >   ALTER TABLE ONLY public.pedidos DROP CONSTRAINT pedidos_pkey;
       public            postgres    false    217            y           2606    41258    pedidos fk_cliente    FK CONSTRAINT        ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT fk_cliente FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente);
 <   ALTER TABLE ONLY public.pedidos DROP CONSTRAINT fk_cliente;
       public          postgres    false    3186    215    217            z           2606    41268    itenspedidos fk_pedido    FK CONSTRAINT     �   ALTER TABLE ONLY public.itenspedidos
    ADD CONSTRAINT fk_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido);
 @   ALTER TABLE ONLY public.itenspedidos DROP CONSTRAINT fk_pedido;
       public          postgres    false    218    3190    217            
   �   x�e�]N�0�g�>@4-_��F)� !C�/�i��xJ�
q���ȘT:��'?�Vp�?ߌ˦�	�R��������v-O���Ӂ���{������ʺb6_���}GRw�Ϩ��!x-1��,��Y��0PQl9�_#l���iϑz�a%1O2p��k��2���#�]lx�7���x}�}�(�9�3�cz�J�S=@/`NLQ�����n�         J   x�3��.�rutttr��4�46�30�4�\f����F.�PICNKC=#�e�i�f�$il�gi !�b���� �Y�         O   x�eʱ� �:���%?�Yh8++=����կ���	���ɐ��+zT	/ h��=�_�&�wk�,�`�ҹ?<��_'��     