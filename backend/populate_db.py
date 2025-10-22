import random
from faker import Faker
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Gerador, Evento

NUM_GERADORES = 15  
NUM_EVENTOS = 50   

fake = Faker('pt_BR')

def populate_database():
    print("Iniciando a população do banco de dados...")
    db: Session = SessionLocal()

    try:
        print(f"Criando {NUM_GERADORES} geradores...")
        created_geradores = []
        for i in range(NUM_GERADORES):
            nome_gerador = f"{fake.company_suffix()} {fake.word().capitalize()} G-{i+1}"
            descricao_gerador = fake.sentence(nb_words=10)

            db_gerador = Gerador(
                nome=nome_gerador,
                descricao=descricao_gerador
            )
            db.add(db_gerador)
            created_geradores.append(db_gerador) 

        db.commit()
        print("Geradores criados.")

        gerador_ids = [g.id for g in created_geradores if g.id is not None]

        if not gerador_ids:
            print("Nenhum gerador foi criado ou IDs não foram obtidos. Abortando criação de eventos.")
            return

        print(f"Criando {NUM_EVENTOS} eventos...")
        for _ in range(NUM_EVENTOS):
            local_evento = fake.city()
            descricao_evento = fake.text(max_nb_chars=150)
            data_evento = fake.date_between(start_date='-6m', end_date='+6m')
            operador_evento = fake.name()
            responsavel_evento = fake.name()
            fone_resp_evento = fake.phone_number()
            gerador_id_aleatorio = random.choice(gerador_ids)

            db_evento = Evento(
                local=local_evento,
                descricao=descricao_evento,
                data=data_evento,
                operador=operador_evento,
                responsavel=responsavel_evento,
                fone_resp=fone_resp_evento,
                id_gerador=gerador_id_aleatorio
            )
            db.add(db_evento)

        db.commit()
        print("Eventos criados.")

        print("População do banco de dados concluída com sucesso!")

    except Exception as e:
        print(f"Ocorreu um erro: {e}")
        db.rollback() 
    finally:
        db.close() 
        
if __name__ == "__main__":
    populate_database()